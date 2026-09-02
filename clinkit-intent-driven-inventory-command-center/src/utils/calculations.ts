import {
  Product,
  InventoryRecord,
  CustomerInteraction,
  Order,
  LockedInventoryItem,
  IntentRestockAnalysis,
  DeadStockItem,
  PurchaseOrderItem
} from '../types';

export function calculateStandardDeviation(values: number[]): number {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function computeInventoryAnalytics(
  products: Product[],
  inventory: InventoryRecord[],
  interactions: CustomerInteraction[],
  orders: Order[],
  flushedSessionIds: Set<string> = new Set()
) {
  // Set of session IDs that placed completed orders
  const orderedSessionIds = new Set(orders.map(o => o.Session_ID));

  // Find all Add_to_Cart interactions
  const addToCartInteractions = interactions.filter(i => i.Interaction_Type === 'Add_to_Cart');

  // Filter trapped interactions (Add_to_Cart where session is NOT in orders.csv AND not yet flushed)
  const trappedInteractions = addToCartInteractions.filter(
    i => !orderedSessionIds.has(i.Session_ID) && !flushedSessionIds.has(i.Session_ID)
  );

  // Group trapped carts by session
  const trappedSessionIds = new Set(trappedInteractions.map(i => i.Session_ID));
  const totalTrappedCarts = trappedSessionIds.size;

  // Compute latest closing stock per product (from day 31)
  const latestInventoryMap: Record<string, InventoryRecord> = {};
  inventory.forEach(rec => {
    // Keep most recent date
    if (!latestInventoryMap[rec.Product_ID] || rec.Date > latestInventoryMap[rec.Product_ID].Date) {
      latestInventoryMap[rec.Product_ID] = rec;
    }
  });

  // Calculate Locked Inventory per product
  const lockedUnitsPerProduct: Record<string, number> = {};
  const trappedSessionsPerProduct: Record<string, Set<string>> = {};

  trappedInteractions.forEach(item => {
    lockedUnitsPerProduct[item.Product_ID] = (lockedUnitsPerProduct[item.Product_ID] || 0) + 1;
    if (!trappedSessionsPerProduct[item.Product_ID]) {
      trappedSessionsPerProduct[item.Product_ID] = new Set();
    }
    trappedSessionsPerProduct[item.Product_ID].add(item.Session_ID);
  });

  let totalLostRevenue = 0;
  const lockedInventoryList: LockedInventoryItem[] = products.map(p => {
    const lockedUnits = lockedUnitsPerProduct[p.Product_ID] || 0;
    const lockedVal = Number((lockedUnits * p.Price).toFixed(2));
    totalLostRevenue += lockedVal;

    const latestInv = latestInventoryMap[p.Product_ID];
    const closingStock = latestInv ? latestInv.Closing_Stock : 0;
    const availableAfter = closingStock + lockedUnits;

    return {
      Product_ID: p.Product_ID,
      Product_Name: p.Product_Name,
      Category: p.Category,
      Price: p.Price,
      Locked_Units: lockedUnits,
      Locked_Value: lockedVal,
      Current_Closing_Stock: closingStock,
      Available_After_Unlock: availableAfter,
      Trapped_Sessions_Count: trappedSessionsPerProduct[p.Product_ID]?.size || 0,
      Stock_Status: latestInv ? latestInv.Stock_Status : 'Out of Stock'
    };
  }).sort((a, b) => b.Locked_Value - a.Locked_Value);

  // Compute Intent-Aware ROP for each product
  const daysInPeriod = 31;
  const leadTimeDays = 3;
  const zScore = 1.65; // 95% service level
  const leadTimeFactor = Math.sqrt(leadTimeDays); // sqrt(3)

  const restockAnalysisList: IntentRestockAnalysis[] = products.map(p => {
    // Total Add to Carts for the item
    const productAddCarts = addToCartInteractions.filter(i => i.Product_ID === p.Product_ID).length;
    const productViews = interactions.filter(i => i.Product_ID === p.Product_ID && i.Interaction_Type === 'View').length;
    
    // Daily Intent
    const dailyIntent = productAddCarts / daysInPeriod;

    // Daily units sold history
    const productDailySales = inventory
      .filter(inv => inv.Product_ID === p.Product_ID)
      .map(inv => inv.Units_Sold);

    const totalUnitsSold = productDailySales.reduce((sum, v) => sum + v, 0);
    const dailySalesAvg = totalUnitsSold / daysInPeriod;
    const dailySalesStdDev = calculateStandardDeviation(productDailySales);

    // Safety Stock = 1.65 * StdDev(Daily Sales) * sqrt(3)
    const safetyStock = zScore * dailySalesStdDev * leadTimeFactor;

    // Intent-Aware ROP = (Daily Intent * 3) + Safety Stock
    const intentAwareROP = (dailyIntent * leadTimeDays) + safetyStock;

    // Traditional ROP = (Daily Sales Avg * 3) + Safety Stock (for comparison)
    const traditionalROP = (dailySalesAvg * leadTimeDays) + safetyStock;

    const latestInv = latestInventoryMap[p.Product_ID];
    const closingStock = latestInv ? latestInv.Closing_Stock : 0;
    const stockDelta = closingStock - intentAwareROP;

    const isUrgent = closingStock <= intentAwareROP;

    let restockStatus: '🚨 URGENT RESTOCK' | '⚠️ WATCHLIST' | '✅ OPTIMAL' | '📦 OVERSTOCKED' = '✅ OPTIMAL';
    if (isUrgent) {
      restockStatus = '🚨 URGENT RESTOCK';
    } else if (stockDelta <= 3) {
      restockStatus = '⚠️ WATCHLIST';
    } else if (closingStock > 30 && productAddCarts < 15) {
      restockStatus = '📦 OVERSTOCKED';
    }

    const suggestedReorderQty = isUrgent ? Math.ceil((intentAwareROP * 2.5) - closingStock + safetyStock) : 0;
    const estimatedRestockCost = Number((suggestedReorderQty * p.Price * 0.6).toFixed(2)); // wholesale is ~60% of retail

    return {
      Product_ID: p.Product_ID,
      Product_Name: p.Product_Name,
      Category: p.Category,
      Price: p.Price,
      Total_Views: productViews,
      Total_Add_to_Carts: productAddCarts,
      Total_Units_Sold: totalUnitsSold,
      Daily_Intent: Number(dailyIntent.toFixed(2)),
      Daily_Sales_Avg: Number(dailySalesAvg.toFixed(2)),
      Daily_Sales_StdDev: Number(dailySalesStdDev.toFixed(2)),
      Safety_Stock: Number(safetyStock.toFixed(2)),
      Traditional_ROP: Number(traditionalROP.toFixed(2)),
      Intent_Aware_ROP: Number(intentAwareROP.toFixed(2)),
      Closing_Stock: closingStock,
      Stock_Delta: Number(stockDelta.toFixed(2)),
      Restock_Status: restockStatus,
      Suggested_Reorder_Qty: Math.max(0, suggestedReorderQty),
      Estimated_Restock_Cost: estimatedRestockCost,
      Is_Urgent: isUrgent
    };
  }).sort((a, b) => {
    if (a.Is_Urgent && !b.Is_Urgent) return -1;
    if (!a.Is_Urgent && b.Is_Urgent) return 1;
    return a.Stock_Delta - b.Stock_Delta;
  });

  const urgentRestockCount = restockAnalysisList.filter(item => item.Is_Urgent).length;

  // Dead Stock Identification: Closing_Stock > 15 AND Total Add_to_Carts < 10
  const deadStockItems: DeadStockItem[] = [];
  const scatterPlotData: Array<{
    Product_ID: string;
    Product_Name: string;
    Category: string;
    Price: number;
    Closing_Stock: number;
    Total_Add_to_Carts: number;
    Is_Dead_Stock: boolean;
    Quadrant: string;
  }> = [];

  const bundleSuggestions: Record<string, { recommendation: string; discount: string }> = {
    P111: { recommendation: 'Pair with Artisan Ramen / Rice in Gourmet Culinary Box', discount: '40% Off' },
    P112: { recommendation: 'Bundle with Kitchen Olive Oil & Salt set at 50% clearance', discount: '50% Off' },
    P113: { recommendation: 'Flash liquidation or free gift with orders over $75', discount: '65% Off' },
    P114: { recommendation: 'Wellness Self-Care Bundle with Wildflower Honey', discount: '45% Off' },
    P119: { recommendation: 'Home Decor Clearance flash deal / Buy-1-Get-1', discount: '55% Off' }
  };

  products.forEach(p => {
    const analysis = restockAnalysisList.find(a => a.Product_ID === p.Product_ID);
    const closingStock = analysis ? analysis.Closing_Stock : 0;
    const addCarts = analysis ? analysis.Total_Add_to_Carts : 0;
    const views = analysis ? analysis.Total_Views : 0;
    const unitsSold = analysis ? analysis.Total_Units_Sold : 0;

    const isDead = closingStock > 15 && addCarts < 10;

    let quadrant = 'Normal Inventory';
    if (isDead) {
      quadrant = '🎯 Dead Stock (High Stock, Low Intent)';
    } else if (closingStock <= 15 && addCarts >= 10) {
      quadrant = '⚡ High Velocity (High Intent, Low Stock)';
    } else if (closingStock > 15 && addCarts >= 10) {
      quadrant = '🌟 Star Performer (High Intent, High Stock)';
    } else {
      quadrant = '💤 Low Velocity (Low Intent, Low Stock)';
    }

    scatterPlotData.push({
      Product_ID: p.Product_ID,
      Product_Name: p.Product_Name,
      Category: p.Category,
      Price: p.Price,
      Closing_Stock: closingStock,
      Total_Add_to_Carts: addCarts,
      Is_Dead_Stock: isDead,
      Quadrant: quadrant
    });

    if (isDead) {
      const suggestion = bundleSuggestions[p.Product_ID] || {
        recommendation: 'Bundle with popular category leader at 35% discount',
        discount: '35% Off'
      };

      deadStockItems.push({
        Product_ID: p.Product_ID,
        Product_Name: p.Product_Name,
        Category: p.Category,
        Price: p.Price,
        Closing_Stock: closingStock,
        Total_Add_to_Carts: addCarts,
        Total_Views: views,
        Units_Sold: unitsSold,
        Dead_Stock_Capital: Number((closingStock * p.Price).toFixed(2)),
        Bundle_Recommendation: suggestion.recommendation,
        Suggested_Discount: suggestion.discount
      });
    }
  });

  return {
    totalLostRevenue: Number(totalLostRevenue.toFixed(2)),
    totalTrappedCarts,
    urgentRestockCount,
    lockedInventoryList,
    restockAnalysisList,
    deadStockItems,
    scatterPlotData,
    trappedSessionIds
  };
}

export function generatePurchaseOrders(analyses: IntentRestockAnalysis[]): PurchaseOrderItem[] {
  const suppliers: Record<string, { name: string; leadTime: number; costRatio: number }> = {
    Beverages: { name: 'Pacific Beverage Distributors', leadTime: 2, costRatio: 0.58 },
    'Instant Foods': { name: 'Asia Pacific Direct Supply Co.', leadTime: 3, costRatio: 0.52 },
    'Dairy & Plant Milk': { name: 'Pure Valley Organics', leadTime: 2, costRatio: 0.60 },
    'Pantry Essentials': { name: 'Global Pantry Wholesalers', leadTime: 4, costRatio: 0.50 },
    'Breakfast & Snacks': { name: 'Sunrise Food Brokers', leadTime: 3, costRatio: 0.55 },
    'Specialty Condiments': { name: 'Epicurean Imports Ltd.', leadTime: 5, costRatio: 0.65 },
    'Home & Kitchen': { name: 'Apex Warehousing & Goods', leadTime: 6, costRatio: 0.45 },
    Electronics: { name: 'VoltLine Components', leadTime: 4, costRatio: 0.40 },
    'Personal Care': { name: 'Botanica Wellness Labs', leadTime: 3, costRatio: 0.50 }
  };

  return analyses
    .filter(a => a.Is_Urgent || a.Stock_Delta <= 3)
    .map(item => {
      const supp = suppliers[item.Category] || { name: 'General Supply Hub', leadTime: 3, costRatio: 0.55 };
      const orderQty = Math.max(25, Math.ceil(item.Intent_Aware_ROP * 2.2 - item.Closing_Stock + item.Safety_Stock));
      const unitCost = Number((item.Price * supp.costRatio).toFixed(2));
      const totalCost = Number((orderQty * unitCost).toFixed(2));

      const priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' = item.Closing_Stock <= 3 ? 'CRITICAL' : item.Is_Urgent ? 'HIGH' : 'MEDIUM';

      return {
        Product_ID: item.Product_ID,
        Product_Name: item.Product_Name,
        Category: item.Category,
        Current_Stock: item.Closing_Stock,
        Intent_ROP: item.Intent_Aware_ROP,
        Order_Qty: orderQty,
        Unit_Cost: unitCost,
        Total_Cost: totalCost,
        Supplier: supp.name,
        Lead_Time_Days: supp.leadTime,
        Priority: priority
      };
    })
    .sort((a, b) => {
      const rank = { CRITICAL: 1, HIGH: 2, MEDIUM: 3 };
      return rank[a.Priority] - rank[b.Priority];
    });
}
