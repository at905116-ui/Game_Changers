import { Product, InventoryRecord, CustomerInteraction, Order } from '../types';

export const PRODUCTS: Product[] = [
  { Product_ID: 'P101', Product_Name: 'Fresh Squeezed Orange Juice (1L)', Category: 'Beverages', Price: 5.99 },
  { Product_ID: 'P102', Product_Name: 'Spicy Shin Instant Ramen Noodles (Pack of 5)', Category: 'Instant Foods', Price: 7.49 },
  { Product_ID: 'P103', Product_Name: 'Organic Unsweetened Almond Milk (1L)', Category: 'Dairy & Plant Milk', Price: 4.89 },
  { Product_ID: 'P104', Product_Name: 'Artisan Dark Roast Ground Coffee (500g)', Category: 'Beverages', Price: 14.99 },
  { Product_ID: 'P105', Product_Name: 'Himalayan Pink Rock Salt (1kg)', Category: 'Pantry Essentials', Price: 3.50 },
  { Product_ID: 'P106', Product_Name: 'Extra Virgin Italian Olive Oil (750ml)', Category: 'Pantry Essentials', Price: 18.90 },
  { Product_ID: 'P107', Product_Name: 'Creamy Salted Peanut Butter (500g)', Category: 'Pantry Essentials', Price: 6.20 },
  { Product_ID: 'P108', Product_Name: 'Sparkling Lemon Mineral Water (6x330ml)', Category: 'Beverages', Price: 8.50 },
  { Product_ID: 'P109', Product_Name: 'White Jasmine Fragrant Rice (5kg)', Category: 'Pantry Essentials', Price: 12.00 },
  { Product_ID: 'P110', Product_Name: 'Crunchy Dark Chocolate Granola (400g)', Category: 'Breakfast & Snacks', Price: 7.80 },
  { Product_ID: 'P111', Product_Name: 'Truffle Flavored Avocado Mayo (250g)', Category: 'Specialty Condiments', Price: 11.50 }, // Dead stock candidate
  { Product_ID: 'P112', Product_Name: 'Vintage Floral Bamboo Dish Rack', Category: 'Home & Kitchen', Price: 29.99 }, // Dead stock candidate
  { Product_ID: 'P113', Product_Name: 'Legacy 30-Pin Charging Cable (2m)', Category: 'Electronics', Price: 15.00 }, // Dead stock candidate
  { Product_ID: 'P114', Product_Name: 'Organic Lavender Bath Fizzers (Set of 6)', Category: 'Personal Care', Price: 22.00 }, // Dead stock candidate
  { Product_ID: 'P115', Product_Name: 'Gluten-Free Chia Seed Protein Bar (12pk)', Category: 'Breakfast & Snacks', Price: 24.50 },
  { Product_ID: 'P116', Product_Name: 'Matcha Green Tea Powder Ceremonial (100g)', Category: 'Beverages', Price: 19.99 },
  { Product_ID: 'P117', Product_Name: 'Spicy Kimchi Traditional Claypot (500g)', Category: 'Instant Foods', Price: 9.20 },
  { Product_ID: 'P118', Product_Name: 'Single-Origin Raw Wildflower Honey (350g)', Category: 'Pantry Essentials', Price: 13.50 },
  { Product_ID: 'P119', Product_Name: 'Decorative Neon Cactus Desk Lamp', Category: 'Home & Kitchen', Price: 25.00 }, // Dead stock candidate
  { Product_ID: 'P120', Product_Name: 'Korean Seaweed Roasted Snack Crisps (8pk)', Category: 'Breakfast & Snacks', Price: 5.50 }
];

// Seeded pseudo-random generator for consistent deterministic datasets
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate 31 days in August 2026
const DAYS_IN_AUGUST = 31;

export function generateDatasets() {
  const inventory: InventoryRecord[] = [];
  const interactions: CustomerInteraction[] = [];
  const orders: Order[] = [];

  let interactionCounter = 1000;
  let orderCounter = 5000;
  let sessionCounter = 20000;

  // Track stock per product through August 1-31
  const productStockMap: Record<string, number> = {
    P101: 3,   // Orange juice (nearly out due to outage locking)
    P102: 4,   // Ramen (critical)
    P103: 5,   // Almond milk (critical)
    P104: 6,   // Coffee (critical)
    P105: 45,  // Salt
    P106: 8,   // Olive oil
    P107: 12,  // Peanut butter
    P108: 10,  // Sparkling water
    P109: 22,  // Rice
    P110: 14,  // Granola
    P111: 38,  // Truffle Mayo (DEAD STOCK: high stock 38, very low intent)
    P112: 26,  // Dish rack (DEAD STOCK: high stock 26, very low intent)
    P113: 42,  // 30-pin cable (DEAD STOCK: high stock 42, very low intent)
    P114: 31,  // Bath fizzers (DEAD STOCK: high stock 31, low intent)
    P115: 18,  // Protein bar
    P116: 9,   // Matcha
    P117: 7,   // Kimchi
    P118: 15,  // Honey
    P119: 28,  // Neon lamp (DEAD STOCK: high stock 28, low intent)
    P120: 16   // Seaweed snack
  };

  // Base daily demand profile for each product
  const productDemandRate: Record<string, { viewsPerDay: number; cartRate: number; isOutageVictim: boolean; isDeadStock: boolean }> = {
    P101: { viewsPerDay: 48, cartRate: 0.42, isOutageVictim: true, isDeadStock: false }, // High intent Orange Juice
    P102: { viewsPerDay: 55, cartRate: 0.45, isOutageVictim: true, isDeadStock: false }, // High intent Ramen
    P103: { viewsPerDay: 38, cartRate: 0.38, isOutageVictim: true, isDeadStock: false }, // High intent Almond milk
    P104: { viewsPerDay: 42, cartRate: 0.35, isOutageVictim: true, isDeadStock: false }, // High intent Coffee
    P105: { viewsPerDay: 12, cartRate: 0.18, isOutageVictim: false, isDeadStock: false },
    P106: { viewsPerDay: 25, cartRate: 0.28, isOutageVictim: true, isDeadStock: false },
    P107: { viewsPerDay: 20, cartRate: 0.22, isOutageVictim: false, isDeadStock: false },
    P108: { viewsPerDay: 24, cartRate: 0.25, isOutageVictim: false, isDeadStock: false },
    P109: { viewsPerDay: 18, cartRate: 0.20, isOutageVictim: false, isDeadStock: false },
    P110: { viewsPerDay: 22, cartRate: 0.26, isOutageVictim: false, isDeadStock: false },
    P111: { viewsPerDay: 4, cartRate: 0.05, isOutageVictim: false, isDeadStock: true }, // Truffle Mayo: dead stock
    P112: { viewsPerDay: 3, cartRate: 0.04, isOutageVictim: false, isDeadStock: true }, // Dish Rack: dead stock
    P113: { viewsPerDay: 2, cartRate: 0.02, isOutageVictim: false, isDeadStock: true }, // 30-pin Cable: dead stock
    P114: { viewsPerDay: 5, cartRate: 0.06, isOutageVictim: false, isDeadStock: true }, // Bath Fizzers: dead stock
    P115: { viewsPerDay: 21, cartRate: 0.24, isOutageVictim: false, isDeadStock: false },
    P116: { viewsPerDay: 28, cartRate: 0.32, isOutageVictim: true, isDeadStock: false },
    P117: { viewsPerDay: 30, cartRate: 0.33, isOutageVictim: true, isDeadStock: false },
    P118: { viewsPerDay: 16, cartRate: 0.22, isOutageVictim: false, isDeadStock: false },
    P119: { viewsPerDay: 4, cartRate: 0.05, isOutageVictim: false, isDeadStock: true }, // Neon Lamp: dead stock
    P120: { viewsPerDay: 24, cartRate: 0.28, isOutageVictim: false, isDeadStock: false }
  };

  // Generate day-by-day logs for August
  for (let day = 1; day <= DAYS_IN_AUGUST; day++) {
    const dayStr = `2026-08-${String(day).padStart(2, '0')}`;
    const isOutagePeriod = day >= 24; // Late August outage (Aug 24-31)

    PRODUCTS.forEach((p, pIdx) => {
      const pProfile = productDemandRate[p.Product_ID];
      let openingStock = productStockMap[p.Product_ID];
      let dailyViews = 0;
      let dailyAddCarts = 0;
      let dailyUnitsSold = 0;

      // Base variance
      const seed = day * 100 + pIdx;
      const noise = (seededRandom(seed) - 0.5) * 0.4;
      const numInteractions = Math.max(1, Math.round(pProfile.viewsPerDay * (1 + noise)));

      for (let i = 0; i < numInteractions; i++) {
        interactionCounter++;
        sessionCounter++;
        const customerId = `CUST_${100 + ((interactionCounter * 7) % 800)}`;
        const sessionId = `SESS_${sessionCounter}`;
        const timeHour = String(8 + (i % 14)).padStart(2, '0');
        const timeMin = String((i * 7) % 60).padStart(2, '0');
        const timestamp = `${dayStr} ${timeHour}:${timeMin}:00`;

        // Always log a View
        dailyViews++;
        interactions.push({
          Interaction_ID: `INT_${interactionCounter}`,
          Timestamp: timestamp,
          Customer_ID: customerId,
          Session_ID: sessionId,
          Product_ID: p.Product_ID,
          Interaction_Type: 'View'
        });

        // Check if user Adds to Cart
        const willCart = seededRandom(seed + i * 3) < pProfile.cartRate;
        if (willCart) {
          dailyAddCarts++;
          interactionCounter++;
          interactions.push({
            Interaction_ID: `INT_${interactionCounter}`,
            Timestamp: `${dayStr} ${timeHour}:${timeMin}:30`,
            Customer_ID: customerId,
            Session_ID: sessionId,
            Product_ID: p.Product_ID,
            Interaction_Type: 'Add_to_Cart'
          });

          // Checkout logic:
          // Normal period (Aug 1-23): 82% of carts convert to orders (18% organic dropoff)
          // Outage period (Aug 24-31): Outage causes 70.5% abandonment (only 29.5% convert)!
          const checkoutChance = isOutagePeriod ? 0.295 : 0.82;
          const successfulOrder = seededRandom(seed + i * 7) < checkoutChance;

          if (successfulOrder && openingStock > 0) {
            orderCounter++;
            const qty = 1;
            dailyUnitsSold += qty;
            orders.push({
              Order_ID: `ORD_${orderCounter}`,
              Order_Timestamp: `${dayStr} ${timeHour}:${timeMin}:55`,
              Customer_ID: customerId,
              Session_ID: sessionId,
              Product_ID: p.Product_ID,
              Quantity: qty,
              Unit_Price: p.Price,
              Total_Amount: Number((qty * p.Price).toFixed(2))
            });
          }
        }
      }

      // Calculate replenishment if day is 10 or 20
      let replenishment = 0;
      if (day === 10 && openingStock < 10) replenishment = 20;
      if (day === 20 && openingStock < 8) replenishment = 15;

      const closingStock = Math.max(0, openingStock - dailyUnitsSold + replenishment);
      productStockMap[p.Product_ID] = closingStock;

      let status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Critical' = 'In Stock';
      if (closingStock === 0) status = 'Out of Stock';
      else if (closingStock <= 5) status = 'Critical';
      else if (closingStock <= 12) status = 'Low Stock';

      inventory.push({
        Date: dayStr,
        Product_ID: p.Product_ID,
        Opening_Stock: openingStock,
        Units_Sold: dailyUnitsSold,
        Replenishment_Units: replenishment,
        Closing_Stock: closingStock,
        Stock_Status: status
      });
    });
  }

  return { products: PRODUCTS, inventory, interactions, orders };
}

// Convert datasets to CSV format strings for downloading & Python app consumption
export function convertToCSV<T extends object>(data: T[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers
      .map(header => {
        const val = (row as Record<string, unknown>)[header];
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val !== undefined && val !== null ? String(val) : '';
      })
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}
