export interface Product {
  Product_ID: string;
  Product_Name: string;
  Category: string;
  Price: number;
}

export interface InventoryRecord {
  Date: string;
  Product_ID: string;
  Opening_Stock: number;
  Units_Sold: number;
  Replenishment_Units: number;
  Closing_Stock: number;
  Stock_Status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Critical';
}

export interface CustomerInteraction {
  Interaction_ID: string;
  Timestamp: string;
  Customer_ID: string;
  Session_ID: string;
  Product_ID: string;
  Interaction_Type: 'View' | 'Add_to_Cart';
}

export interface Order {
  Order_ID: string;
  Order_Timestamp: string;
  Customer_ID: string;
  Session_ID: string;
  Product_ID: string;
  Quantity: number;
  Unit_Price: number;
  Total_Amount: number;
}

export interface LockedInventoryItem {
  Product_ID: string;
  Product_Name: string;
  Category: string;
  Price: number;
  Locked_Units: number;
  Locked_Value: number;
  Current_Closing_Stock: number;
  Available_After_Unlock: number;
  Trapped_Sessions_Count: number;
  Stock_Status: string;
}

export interface IntentRestockAnalysis {
  Product_ID: string;
  Product_Name: string;
  Category: string;
  Price: number;
  Total_Views: number;
  Total_Add_to_Carts: number;
  Total_Units_Sold: number;
  Daily_Intent: number; // Add_to_Carts / 31
  Daily_Sales_Avg: number;
  Daily_Sales_StdDev: number; // Std dev of daily units sold
  Safety_Stock: number; // 1.65 * StdDev * sqrt(3)
  Traditional_ROP: number; // (Daily_Sales_Avg * 3) + Safety_Stock
  Intent_Aware_ROP: number; // (Daily_Intent * 3) + Safety_Stock
  Closing_Stock: number;
  Stock_Delta: number; // Closing_Stock - Intent_Aware_ROP
  Restock_Status: '🚨 URGENT RESTOCK' | '⚠️ WATCHLIST' | '✅ OPTIMAL' | '📦 OVERSTOCKED';
  Suggested_Reorder_Qty: number;
  Estimated_Restock_Cost: number;
  Is_Urgent: boolean;
}

export interface DeadStockItem {
  Product_ID: string;
  Product_Name: string;
  Category: string;
  Price: number;
  Closing_Stock: number;
  Total_Add_to_Carts: number;
  Total_Views: number;
  Units_Sold: number;
  Dead_Stock_Capital: number;
  Bundle_Recommendation: string;
  Suggested_Discount: string;
}

export interface PurchaseOrderItem {
  Product_ID: string;
  Product_Name: string;
  Category: string;
  Current_Stock: number;
  Intent_ROP: number;
  Order_Qty: number;
  Unit_Cost: number;
  Total_Cost: number;
  Supplier: string;
  Lead_Time_Days: number;
  Priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}
