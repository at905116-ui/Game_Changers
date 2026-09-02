export const PYTHON_STREAMLIT_CODE = `"""
================================================================================
CLINKIT INTENT-DRIVEN INVENTORY COMMAND CENTER (Streamlit app.py)
================================================================================
Author: Expert Data Scientist & Streamlit UI Developer
Hackathon: Clinkit E-Commerce Outage Recovery & Intent-Aware Inventory Hackathon

Problem Context:
- Late August checkout gateway outage caused a 70.5% cart abandonment spike.
- Inventory was locked during Add_to_Cart but not released upon failed checkout.
- High demand items (Orange Juice, Instant Noodles) show as "Critical/Out of Stock" (Phantom Stock).
- Traditional ROP based on suppressed sales under-forecasts demand.
- Intent-Aware ROP calculates real top-of-funnel velocity to prevent stockouts.

Mathematical Logic:
- Daily Intent = (Total 'Add_to_Cart' actions for the item) / 31 days
- Safety Stock = 1.65 * (Standard Deviation of Daily Units Sold) * sqrt(3)
- Intent_Aware_ROP = (Daily Intent * 3 days lead time) + Safety Stock
================================================================================
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import math
import os

# -----------------------------------------------------------------------------
# 1. PAGE CONFIGURATION & CUSTOM MODERN THEME
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Clinkit Intent-Driven Inventory Command Center",
    page_icon="📦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS styling for sleek, modern Streamlit UI
st.markdown("""
<style>
    /* Metric Card styling */
    div[data-testid="stMetricValue"] {
        font-size: 1.9rem !important;
        font-weight: 700;
        color: #1e293b;
    }
    div[data-testid="stMetricLabel"] {
        font-size: 0.95rem !important;
        font-weight: 600;
        color: #64748b;
    }
    .metric-container {
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 18px 22px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        margin-bottom: 15px;
    }
    .badge-urgent {
        background-color: #fee2e2;
        color: #991b1b;
        padding: 4px 8px;
        border-radius: 6px;
        font-weight: 600;
    }
    .banner-box {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 20px;
    }
</style>
""", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# 2. DATA GENERATION / LOADING HELPERS (Creates files if not present)
# -----------------------------------------------------------------------------
@st.cache_data
def load_or_create_data():
    """
    Loads the 4 CSV files (inventory.csv, products.csv, customer_interactions.csv, orders.csv)
    or generates deterministic synthetic data if not found in root directory.
    """
    products_file = "products.csv"
    inventory_file = "inventory.csv"
    interactions_file = "customer_interactions.csv"
    orders_file = "orders.csv"

    # If files exist on disk, read them directly
    if os.path.exists(products_file) and os.path.exists(inventory_file) and \
       os.path.exists(interactions_file) and os.path.exists(orders_file):
        df_products = pd.read_csv(products_file)
        df_inventory = pd.read_csv(inventory_file)
        df_interactions = pd.read_csv(interactions_file)
        df_orders = pd.read_csv(orders_file)
        return df_products, df_inventory, df_interactions, df_orders

    # Otherwise synthesize representative dataset for Clinkit hackathon
    products_data = [
        {"Product_ID": "P101", "Product_Name": "Fresh Squeezed Orange Juice (1L)", "Category": "Beverages", "Price": 5.99},
        {"Product_ID": "P102", "Product_Name": "Spicy Shin Instant Ramen Noodles (5pk)", "Category": "Instant Foods", "Price": 7.49},
        {"Product_ID": "P103", "Product_Name": "Organic Unsweetened Almond Milk (1L)", "Category": "Dairy & Plant Milk", "Price": 4.89},
        {"Product_ID": "P104", "Product_Name": "Artisan Dark Roast Ground Coffee (500g)", "Category": "Beverages", "Price": 14.99},
        {"Product_ID": "P105", "Product_Name": "Himalayan Pink Rock Salt (1kg)", "Category": "Pantry Essentials", "Price": 3.50},
        {"Product_ID": "P106", "Product_Name": "Extra Virgin Italian Olive Oil (750ml)", "Category": "Pantry Essentials", "Price": 18.90},
        {"Product_ID": "P107", "Product_Name": "Creamy Salted Peanut Butter (500g)", "Category": "Pantry Essentials", "Price": 6.20},
        {"Product_ID": "P108", "Product_Name": "Sparkling Lemon Mineral Water (6pk)", "Category": "Beverages", "Price": 8.50},
        {"Product_ID": "P109", "Product_Name": "White Jasmine Fragrant Rice (5kg)", "Category": "Pantry Essentials", "Price": 12.00},
        {"Product_ID": "P110", "Product_Name": "Crunchy Dark Chocolate Granola (400g)", "Category": "Breakfast & Snacks", "Price": 7.80},
        {"Product_ID": "P111", "Product_Name": "Truffle Flavored Avocado Mayo (250g)", "Category": "Specialty Condiments", "Price": 11.50},
        {"Product_ID": "P112", "Product_Name": "Vintage Floral Bamboo Dish Rack", "Category": "Home & Kitchen", "Price": 29.99},
        {"Product_ID": "P113", "Product_Name": "Legacy 30-Pin Charging Cable (2m)", "Category": "Electronics", "Price": 15.00},
        {"Product_ID": "P114", "Product_Name": "Organic Lavender Bath Fizzers (Set of 6)", "Category": "Personal Care", "Price": 22.00},
        {"Product_ID": "P115", "Product_Name": "Gluten-Free Chia Seed Protein Bar (12pk)", "Category": "Breakfast & Snacks", "Price": 24.50},
        {"Product_ID": "P116", "Product_Name": "Matcha Green Tea Powder Ceremonial (100g)", "Category": "Beverages", "Price": 19.99},
        {"Product_ID": "P117", "Product_Name": "Spicy Kimchi Traditional Claypot (500g)", "Category": "Instant Foods", "Price": 9.20},
        {"Product_ID": "P118", "Product_Name": "Single-Origin Raw Wildflower Honey (350g)", "Category": "Pantry Essentials", "Price": 13.50},
        {"Product_ID": "P119", "Product_Name": "Decorative Neon Cactus Desk Lamp", "Category": "Home & Kitchen", "Price": 25.00},
        {"Product_ID": "P120", "Product_Name": "Korean Seaweed Roasted Snack Crisps (8pk)", "Category": "Breakfast & Snacks", "Price": 5.50},
    ]
    df_products = pd.DataFrame(products_data)

    # Generate August dates (1 to 31)
    np.random.seed(42)
    inv_rows = []
    interactions_rows = []
    orders_rows = []

    int_id = 1000
    ord_id = 5000
    sess_id = 20000

    # Current stock simulation
    stocks = {
        "P101": 3, "P102": 4, "P103": 5, "P104": 6, "P105": 45, "P106": 8, "P107": 12,
        "P108": 10, "P109": 22, "P110": 14, "P111": 38, "P112": 26, "P113": 42, "P114": 31,
        "P115": 18, "P116": 9, "P117": 7, "P118": 15, "P119": 28, "P120": 16
    }

    # Demand profiles
    demands = {
        "P101": {"views": 48, "cart": 0.42}, "P102": {"views": 55, "cart": 0.45},
        "P103": {"views": 38, "cart": 0.38}, "P104": {"views": 42, "cart": 0.35},
        "P105": {"views": 12, "cart": 0.18}, "P106": {"views": 25, "cart": 0.28},
        "P107": {"views": 20, "cart": 0.22}, "P108": {"views": 24, "cart": 0.25},
        "P109": {"views": 18, "cart": 0.20}, "P110": {"views": 22, "cart": 0.26},
        "P111": {"views": 4, "cart": 0.05},  "P112": {"views": 3, "cart": 0.04}, # Dead Stock
        "P113": {"views": 2, "cart": 0.02},  "P114": {"views": 5, "cart": 0.06}, # Dead Stock
        "P115": {"views": 21, "cart": 0.24}, "P116": {"views": 28, "cart": 0.32},
        "P117": {"views": 30, "cart": 0.33}, "P118": {"views": 16, "cart": 0.22},
        "P119": {"views": 4, "cart": 0.05},  "P120": {"views": 24, "cart": 0.28}  # Dead Stock
    }

    for day in range(1, 32):
        date_str = f"2026-08-{day:02d}"
        is_outage = (day >= 24) # Outage happened late August (Aug 24-31)

        for _, prod in df_products.iterrows():
            pid = prod["Product_ID"]
            price = prod["Price"]
            prof = demands[pid]

            opening = stocks[pid]
            sold = 0
            n_views = max(1, int(np.random.normal(prof["views"], 3)))

            for _ in range(n_views):
                int_id += 1
                sess_id += 1
                cust_id = f"CUST_{np.random.randint(100, 900)}"
                s_id = f"SESS_{sess_id}"

                # View interaction
                interactions_rows.append({
                    "Interaction_ID": f"INT_{int_id}",
                    "Timestamp": f"{date_str} 10:00:00",
                    "Customer_ID": cust_id,
                    "Session_ID": s_id,
                    "Product_ID": pid,
                    "Interaction_Type": "View"
                })

                # Add to Cart
                if np.random.rand() < prof["cart"]:
                    int_id += 1
                    interactions_rows.append({
                        "Interaction_ID": f"INT_{int_id}",
                        "Timestamp": f"{date_str} 10:05:00",
                        "Customer_ID": cust_id,
                        "Session_ID": s_id,
                        "Product_ID": pid,
                        "Interaction_Type": "Add_to_Cart"
                    })

                    # Conversion: normal is 82%, during outage abandonment hits 70.5% (conversion = 29.5%)
                    conv_rate = 0.295 if is_outage else 0.82
                    if np.random.rand() < conv_rate and opening > 0:
                        ord_id += 1
                        sold += 1
                        orders_rows.append({
                            "Order_ID": f"ORD_{ord_id}",
                            "Order_Timestamp": f"{date_str} 10:10:00",
                            "Customer_ID": cust_id,
                            "Session_ID": s_id,
                            "Product_ID": pid,
                            "Quantity": 1,
                            "Unit_Price": price,
                            "Total_Amount": price
                        })

            replenishment = 20 if (day == 10 and opening < 10) else (15 if (day == 20 and opening < 8) else 0)
            closing = max(0, opening - sold + replenishment)
            stocks[pid] = closing

            status = "In Stock"
            if closing == 0:
                status = "Out of Stock"
            elif closing <= 5:
                status = "Critical"
            elif closing <= 12:
                status = "Low Stock"

            inv_rows.append({
                "Date": date_str,
                "Product_ID": pid,
                "Opening_Stock": opening,
                "Units_Sold": sold,
                "Replenishment_Units": replenishment,
                "Closing_Stock": closing,
                "Stock_Status": status
            })

    df_inventory = pd.DataFrame(inv_rows)
    df_interactions = pd.DataFrame(interactions_rows)
    df_orders = pd.DataFrame(orders_rows)

    # Save to disk for re-use
    df_products.to_csv(products_file, index=False)
    df_inventory.to_csv(inventory_file, index=False)
    df_interactions.to_csv(interactions_file, index=False)
    df_orders.to_csv(orders_file, index=False)

    return df_products, df_inventory, df_interactions, df_orders


# -----------------------------------------------------------------------------
# 3. MATHEMATICAL LOGIC: INTENT-AWARE REORDER POINT (ROP)
# -----------------------------------------------------------------------------
def calculate_intent_aware_rop(df_products, df_inventory, df_interactions):
    """
    Computes Intent-Aware Reorder Point (ROP):
    - Daily Intent = (Total 'Add_to_Cart' actions for the item) / 31 days
    - Safety Stock = 1.65 * (Standard Deviation of Daily Units Sold) * sqrt(3)
    - Intent_Aware_ROP = (Daily Intent * 3 days lead time) + Safety Stock
    """
    LEAD_TIME_DAYS = 3
    DAYS_IN_MONTH = 31
    Z_SCORE = 1.65  # 95% service level
    LEAD_TIME_SQRT = math.sqrt(LEAD_TIME_DAYS)

    # Filter Add to Carts
    add_to_carts = df_interactions[df_interactions["Interaction_Type"] == "Add_to_Cart"]
    cart_counts = add_to_carts.groupby("Product_ID").size().reset_index(name="Total_Add_to_Carts")

    # Group daily sales std dev & average from inventory
    sales_stats = df_inventory.groupby("Product_ID")["Units_Sold"].agg(
        Total_Units_Sold="sum",
        Daily_Sales_Avg="mean",
        Daily_Sales_Std="std"
    ).reset_index()
    sales_stats["Daily_Sales_Std"] = sales_stats["Daily_Sales_Std"].fillna(0)

    # Latest closing stock per product (Day 31)
    latest_date = df_inventory["Date"].max()
    latest_inv = df_inventory[df_inventory["Date"] == latest_date][["Product_ID", "Closing_Stock", "Stock_Status"]]

    # Merge into master analytics dataframe
    df_merged = df_products.merge(cart_counts, on="Product_ID", how="left").fillna({"Total_Add_to_Carts": 0})
    df_merged = df_merged.merge(sales_stats, on="Product_ID", how="left")
    df_merged = df_merged.merge(latest_inv, on="Product_ID", how="left")

    # Formula implementations
    df_merged["Daily_Intent"] = df_merged["Total_Add_to_Carts"] / DAYS_IN_MONTH
    df_merged["Safety_Stock"] = Z_SCORE * df_merged["Daily_Sales_Std"] * LEAD_TIME_SQRT
    df_merged["Intent_Aware_ROP"] = (df_merged["Daily_Intent"] * LEAD_TIME_DAYS) + df_merged["Safety_Stock"]
    df_merged["Traditional_ROP"] = (df_merged["Daily_Sales_Avg"] * LEAD_TIME_DAYS) + df_merged["Safety_Stock"]

    # Round numerical fields for pristine display
    df_merged["Daily_Intent"] = df_merged["Daily_Intent"].round(2)
    df_merged["Safety_Stock"] = df_merged["Safety_Stock"].round(2)
    df_merged["Intent_Aware_ROP"] = df_merged["Intent_Aware_ROP"].round(2)
    df_merged["Traditional_ROP"] = df_merged["Traditional_ROP"].round(2)

    # Stock Delta & Alert Flagging
    df_merged["Stock_Delta"] = (df_merged["Closing_Stock"] - df_merged["Intent_Aware_ROP"]).round(2)
    df_merged["Restock_Flag"] = df_merged.apply(
        lambda r: "🚨 URGENT RESTOCK" if r["Closing_Stock"] <= r["Intent_Aware_ROP"] else "✅ HEALTHY",
        axis=1
    )

    return df_merged


# -----------------------------------------------------------------------------
# 4. MAIN APP INITIALIZATION & TOP KPIS
# -----------------------------------------------------------------------------
df_products, df_inventory, df_interactions, df_orders = load_or_create_data()

# Handle flush state
if "stock_flushed" not in st.session_state:
    st.session_state.stock_flushed = False

# Filter out orders session IDs
completed_sessions = set(df_orders["Session_ID"].unique())
add_carts_df = df_interactions[df_interactions["Interaction_Type"] == "Add_to_Cart"]

# Identify Trapped Sessions (Add_to_Cart sessions with no matching order)
trapped_carts_df = add_carts_df[~add_carts_df["Session_ID"].isin(completed_sessions)]
trapped_carts_merged = trapped_carts_df.merge(df_products, on="Product_ID", how="left")

# KPI Computations
if not st.session_state.stock_flushed:
    total_lost_revenue = trapped_carts_merged["Price"].sum()
    total_trapped_carts = trapped_carts_df["Session_ID"].nunique()
    total_locked_units = len(trapped_carts_df)
else:
    total_lost_revenue = 0.0
    total_trapped_carts = 0
    total_locked_units = 0

# ROP Analysis
df_rop = calculate_intent_aware_rop(df_products, df_inventory, df_interactions)
urgent_restock_count = (df_rop["Restock_Flag"] == "🚨 URGENT RESTOCK").sum()

# Dashboard Title & Outage Banner
st.title("📦 Clinkit Intent-Driven Inventory Command Center")
st.caption("E-Commerce Outage Recovery • Intent-Aware Reorder Point Engine • Dead Stock Liquidator")

st.markdown("""
<div class="banner-box">
    <strong>⚠️ Outage Diagnostic Context:</strong> Clinkit encountered a severe checkout gateway outage in late August 
    (70.5% cart abandonment spike). Cart-locked inventory created <em>Phantom Stockouts</em>. 
    This command center recalculates Reorder Points using <strong>True Customer Intent (Add_to_Cart)</strong> rather than depressed historical sales.
</div>
""", unsafe_allow_html=True)

# Top 3 Critical KPIs
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric(
        label="💸 Total Lost Revenue",
        value=f"₹{total_lost_revenue:,.2f}",
        delta="-70.5% Abandonment" if not st.session_state.stock_flushed else "Unlocked & Recovered",
        delta_color="inverse"
    )

with col2:
    st.metric(
        label="🛒 Trapped Abandoned Carts",
        value=f"{total_trapped_carts:,} Sessions",
        delta=f"{total_locked_units} Units Locked" if not st.session_state.stock_flushed else "Flushed to Available Stock",
        delta_color="inverse"
    )

with col3:
    st.metric(
        label="🚨 Items Requiring Urgent Restock",
        value=f"{urgent_restock_count} Products",
        delta="Stock <= Intent ROP",
        delta_color="inverse"
    )

with col4:
    avg_intent_lift = round(((df_rop["Intent_Aware_ROP"] - df_rop["Traditional_ROP"]).mean()), 1)
    st.metric(
        label="⚡ Avg Intent ROP Uplift",
        value=f"+{avg_intent_lift} Units",
        delta="vs. Outage-Suppressed Sales",
        delta_color="normal"
    )

st.markdown("---")

# -----------------------------------------------------------------------------
# 5. MULTI-TAB WORKSPACE
# -----------------------------------------------------------------------------
tab1, tab2, tab3 = st.tabs([
    "🔒 Tab 1: Phantom Stock Unlocker (Outage Recovery)",
    "⚡ Tab 2: Intent-Driven Restock Center",
    "📦 Tab 3: Dead Stock Liquidator"
])

# =============================================================================
# TAB 1: PHANTOM STOCK UNLOCKER (OUTAGE RECOVERY)
# =============================================================================
with tab1:
    st.subheader("Outage Inventory Recovery: Trapped Session & Locked Stock Breakdown")
    st.write(
        "During the payment gateway failure, users added items to their carts which reserved warehouse inventory. "
        "Because transactions failed at checkout, this stock remained in an unreleased 'Locked' state."
    )

    # Action Button to Flush Expired Carts
    col_btn, col_info = st.columns([1, 3])
    with col_btn:
        if st.button("🚀 Flush Expired Carts & Release Stock", type="primary", use_container_width=True):
            st.session_state.stock_flushed = True
            st.toast("✅ Success: All 150+ expired outage carts flushed! Stock returned to active inventory.", icon="🎉")
            st.rerun()

    with col_info:
        if st.session_state.stock_flushed:
            st.success("✅ Expired cart reservations have been purged. Available inventory updated across all channels.")
        else:
            st.warning("⚠️ Unreleased phantom stock is currently preventing new customers from purchasing high-demand items.")

    # Calculate Locked Inventory Dataframe per Product_ID
    if not st.session_state.stock_flushed:
        locked_summary = trapped_carts_merged.groupby(["Product_ID", "Product_Name", "Category", "Price"]).agg(
            Locked_Units=("Session_ID", "count"),
            Trapped_Sessions=("Session_ID", "nunique"),
            Locked_Revenue=("Price", "sum")
        ).reset_index()

        # Merge with closing stock
        latest_date = df_inventory["Date"].max()
        curr_stock = df_inventory[df_inventory["Date"] == latest_date][["Product_ID", "Closing_Stock", "Stock_Status"]]
        locked_summary = locked_summary.merge(curr_stock, on="Product_ID", how="left")
        locked_summary["Available_After_Unlock"] = locked_summary["Closing_Stock"] + locked_summary["Locked_Units"]
        locked_summary["Locked_Revenue"] = locked_summary["Locked_Revenue"].round(2)
        locked_summary = locked_summary.sort_values(by="Locked_Units", ascending=False)
    else:
        locked_summary = pd.DataFrame(columns=[
            "Product_ID", "Product_Name", "Category", "Price", "Locked_Units", "Trapped_Sessions",
            "Locked_Revenue", "Closing_Stock", "Stock_Status", "Available_After_Unlock"
        ])

    st.markdown("#### 📋 Locked Inventory per Product")
    if not locked_summary.empty:
        st.dataframe(
            locked_summary.style.format({
                "Price": "₹{:.2f}",
                "Locked_Revenue": "₹{:.2f}",
                "Locked_Units": "{:,}",
                "Trapped_Sessions": "{:,}",
                "Closing_Stock": "{:,}",
                "Available_After_Unlock": "{:,}"
            }).background_gradient(subset=["Locked_Units"], cmap="Reds"),
            use_container_width=True
        )
    else:
        st.info("🎉 No trapped carts currently detected. All phantom reservations are clear.")

    # Visual Breakdown of Trapped Value by Category
    if not st.session_state.stock_flushed and not locked_summary.empty:
        st.markdown("#### 📊 Locked Capital Distribution by Category")
        fig_cat = px.bar(
            locked_summary,
            x="Category",
            y="Locked_Revenue",
            color="Category",
            text="Locked_Revenue",
            title="Trapped Capital by Category (₹ INR)",
            template="plotly_white"
        )
        fig_cat.update_traces(texttemplate='₹%{y:,.2f}', textposition='outside')
        st.plotly_chart(fig_cat, use_container_width=True)


# =============================================================================
# TAB 2: INTENT-DRIVEN RESTOCK CENTER
# =============================================================================
with tab2:
    st.subheader("Intent-Aware Reorder Point (ROP) Engine")
    st.markdown("""
    **Formula Definition:**
    $$\\\\text{Intent-Aware ROP} = (\\\\text{Daily Intent} \\\\times 3 \\\\text{ Days Lead Time}) + 1.65 \\\\times \\\\sigma_{\\\\text{Daily Sales}} \\\\times \\\\sqrt{3}$$
    *Where $\\\\text{Daily Intent} = \\\\frac{\\\\text{Total Add to Carts}}{31}$, and Safety Stock protects against variance with 95% service confidence ($Z=1.65$).*
    """)

    # Filter by category or status
    col_f1, col_f2 = st.columns(2)
    with col_f1:
        category_filter = st.multiselect(
            "Filter Category",
            options=df_rop["Category"].unique(),
            default=df_rop["Category"].unique()
        )
    with col_f2:
        only_urgent = st.checkbox("Show Only 🚨 URGENT RESTOCK Items", value=False)

    # Filtered dataframe
    df_display = df_rop[df_rop["Category"].isin(category_filter)].copy()
    if only_urgent:
        df_display = df_display[df_display["Restock_Flag"] == "🚨 URGENT RESTOCK"]

    # Reorder columns for optimal clarity
    cols_to_show = [
        "Product_ID", "Product_Name", "Category", "Closing_Stock",
        "Intent_Aware_ROP", "Traditional_ROP", "Daily_Intent",
        "Safety_Stock", "Stock_Delta", "Restock_Flag"
    ]

    st.markdown("#### 🔍 Inventory vs. Intent-Aware Reorder Point Matrix")
    
    # Styled dataframe
    def color_restock(val):
        if val == "🚨 URGENT RESTOCK":
            return 'background-color: #fecaca; color: #7f1d1d; font-weight: bold;'
        return 'background-color: #dcfce7; color: #14532d;'

    styled_df = df_display[cols_to_show].style.applymap(
        color_restock, subset=["Restock_Flag"]
    ).format({
        "Closing_Stock": "{:,}",
        "Intent_Aware_ROP": "{:.2f}",
        "Traditional_ROP": "{:.2f}",
        "Daily_Intent": "{:.2f}",
        "Safety_Stock": "{:.2f}",
        "Stock_Delta": "{:+.2f}"
    })

    st.dataframe(styled_df, use_container_width=True)

    # Purchase Order Generation Button
    st.markdown("---")
    st.markdown("#### 📝 Automated Purchase Order (PO) Generator")
    if st.button("📄 Generate Priority Purchase Orders", type="primary"):
        urgent_items = df_rop[df_rop["Restock_Flag"] == "🚨 URGENT RESTOCK"].copy()
        if not urgent_items.empty:
            urgent_items["Suggested_Order_Qty"] = np.ceil(
                (urgent_items["Intent_Aware_ROP"] * 2.5) - urgent_items["Closing_Stock"] + urgent_items["Safety_Stock"]
            ).astype(int)
            urgent_items["Estimated_Wholesale_Cost"] = (urgent_items["Suggested_Order_Qty"] * urgent_items["Price"] * 0.60).round(2)
            
            po_table = urgent_items[[
                "Product_ID", "Product_Name", "Category", "Closing_Stock",
                "Intent_Aware_ROP", "Suggested_Order_Qty", "Estimated_Wholesale_Cost"
            ]]
            
            st.success(f"Generated Purchase Orders for {len(po_table)} critical items (Total PO Value: ₹{po_table['Estimated_Wholesale_Cost'].sum():,.2f})")
            st.dataframe(po_table.style.format({"Estimated_Wholesale_Cost": "₹{:.2f}"}), use_container_width=True)
            
            # Download PO as CSV
            csv_po = po_table.to_csv(index=False).encode('utf-8')
            st.download_button(
                label="📥 Download Purchase Orders (CSV)",
                data=csv_po,
                file_name="Clinkit_Priority_Purchase_Orders.csv",
                mime="text/csv"
            )
        else:
            st.info("No items currently qualify as Urgent Restock.")


# =============================================================================
# TAB 3: DEAD STOCK LIQUIDATOR
# =============================================================================
with tab3:
    st.subheader("Dead Stock Liquidator (High Stock > 15, Low Intent < 10 Add_to_Carts)")
    st.write(
        "Identifies working capital trapped in slow-moving SKUs. "
        "Items with high closing inventory (>15) but virtually no top-of-funnel desire (<10 Add_to_Carts) "
        "are flagged for liquidation bundling and promotional markdowns."
    )

    # Scatter Plot of Closing Stock vs Add_to_Carts
    fig_scatter = px.scatter(
        df_rop,
        x="Closing_Stock",
        y="Total_Add_to_Carts",
        color="Category",
        size="Price",
        hover_data=["Product_ID", "Product_Name", "Price", "Restock_Flag"],
        text="Product_ID",
        title="Inventory Quadrant: Closing Stock vs. Customer Intent (Add_to_Carts)",
        template="plotly_white",
        height=550
    )

    # Quadrant dividing lines: X=15 (High Stock threshold), Y=10 (Low Intent threshold)
    fig_scatter.add_vline(x=15, line_dash="dash", line_color="rgba(100, 116, 139, 0.6)", annotation_text="Stock = 15")
    fig_scatter.add_hline(y=10, line_dash="dash", line_color="rgba(100, 116, 139, 0.6)", annotation_text="Add_to_Carts = 10")

    # Shaded dead stock rectangle
    max_stock = df_rop["Closing_Stock"].max() + 5
    fig_scatter.add_vrect(
        x0=15, x1=max_stock,
        y0=0, y1=10,
        fillcolor="red", opacity=0.08,
        layer="below", line_width=0,
        annotation_text="🎯 DEAD STOCK TARGET ZONE (Stock > 15 & Intent < 10)",
        annotation_position="top right"
    )

    st.plotly_chart(fig_scatter, use_container_width=True)

    # Dead stock candidate list
    dead_stock_df = df_rop[(df_rop["Closing_Stock"] > 15) & (df_rop["Total_Add_to_Carts"] < 10)].copy()
    dead_stock_df["Trapped_Working_Capital"] = (dead_stock_df["Closing_Stock"] * dead_stock_df["Price"]).round(2)

    # Actionable Bundling Strategies
    bundle_map = {
        "P111": ("Gourmet Box", "Pair Truffle Mayo with Instant Noodles / Rice at 40% Off"),
        "P112": ("Kitchen Clearance", "Bundle Bamboo Dish Rack with Olive Oil at 50% Off"),
        "P113": ("Tech Outlet", "Free 30-Pin Cable on Electronics orders over $50"),
        "P114": ("Spa Weekend", "Bundle Lavender Bath Fizzers with Wildflower Honey at 45% Off"),
        "P119": ("Desk Decor Flash Deal", "Buy-1-Get-1 Neon Lamp Promo")
    }

    dead_stock_df["Strategy"] = dead_stock_df["Product_ID"].map(lambda x: bundle_map.get(x, ("Liquidation Bundle", "35% Markdown Deal"))[0])
    dead_stock_df["Actionable_Recommendation"] = dead_stock_df["Product_ID"].map(lambda x: bundle_map.get(x, ("Liquidation Bundle", "35% Markdown Deal"))[1])

    st.markdown("#### 🎯 Identified Liquidation SKU Action Plan")
    if not dead_stock_df.empty:
        total_dead_capital = dead_stock_df["Trapped_Working_Capital"].sum()
        st.warning(f"⚠️ Total Trapped Working Capital in Dead Stock: **₹{total_dead_capital:,.2f}** across {len(dead_stock_df)} SKUs.")

        st.dataframe(
            dead_stock_df[[
                "Product_ID", "Product_Name", "Category", "Closing_Stock",
                "Total_Add_to_Carts", "Price", "Trapped_Working_Capital",
                "Strategy", "Actionable_Recommendation"
            ]].style.format({
                "Price": "₹{:.2f}",
                "Trapped_Working_Capital": "₹{:.2f}",
                "Closing_Stock": "{:,}",
                "Total_Add_to_Carts": "{:,}"
            }),
            use_container_width=True
        )
    else:
        st.success("No dead stock SKUs detected above thresholds.")

# -----------------------------------------------------------------------------
# 6. SIDEBAR CONTROLS & DOCUMENTATION
# -----------------------------------------------------------------------------
with st.sidebar:
    st.header("⚙️ Command Center Settings")
    st.markdown("**Lead Time Assumption:** 3 Days")
    st.markdown("**Service Level Confidence:** 95% ($Z=1.65$)")
    st.markdown("**Outage Period:** Aug 24 - Aug 31")
    
    st.markdown("---")
    st.subheader("💡 Hackathon Key Takeaways")
    st.markdown("""
    1. **Phantom Stock Root Cause:** State divergence between Cart Locking & Order Completion.
    2. **Intent-Aware ROP:** Replaces backward-looking sales during outages with real consumer demand.
    3. **Working Capital Velocity:** Dead stock liquidation releases cash to restock high-intent items.
    """)
    
    if st.button("🔄 Reset Outage Simulation"):
        st.session_state.stock_flushed = False
        st.rerun()
`;
