import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

st.set_page_config(page_title="Retail Stock & Sales Automation App", layout="wide")

st.title("Retail Stock & Sales Automation App")
st.markdown("Upload your stock and sales files to view dashboards, low-stock alerts, and reorder suggestions.")

# -----------------------------
# Helper functions
# -----------------------------
def clean_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [col.strip().lower() for col in df.columns]
    return df

def load_file(uploaded_file):
    if uploaded_file is None:
        return None

    file_name = uploaded_file.name.lower()

    if file_name.endswith(".csv"):
        return pd.read_csv(uploaded_file)
    elif file_name.endswith(".xlsx"):
        return pd.read_excel(uploaded_file)
    else:
        return None

def validate_stock_data(df: pd.DataFrame):
    required_cols = {"product_id", "product_name", "category", "stock_qty", "reorder_level", "supplier"}
    return required_cols.issubset(set(df.columns))

def validate_sales_data(df: pd.DataFrame):
    required_cols = {"date", "product_id", "product_name", "qty_sold", "selling_price", "cashier", "branch"}
    return required_cols.issubset(set(df.columns))

def process_data(stock_df: pd.DataFrame, sales_df: pd.DataFrame):
    sales_summary = (
        sales_df.groupby(["product_id", "product_name"], as_index=False)["qty_sold"]
        .sum()
    )

    merged = pd.merge(
        stock_df,
        sales_summary,
        on=["product_id", "product_name"],
        how="left"
    )

    merged["qty_sold"] = merged["qty_sold"].fillna(0)
    merged["current_stock"] = merged["stock_qty"] - merged["qty_sold"]
    merged["stock_status"] = merged["current_stock"].apply(
        lambda x: "Out of Stock" if x <= 0 else "In Stock"
    )
    merged["low_stock_alert"] = merged["current_stock"] <= merged["reorder_level"]
    merged["reorder_qty"] = (merged["reorder_level"] * 2) - merged["current_stock"]
    merged["reorder_qty"] = merged["reorder_qty"].apply(lambda x: x if x > 0 else 0)

    return merged

# -----------------------------
# Sidebar uploads
# -----------------------------
st.sidebar.header("Upload Files")

stock_file = st.sidebar.file_uploader("Upload Stock File (CSV or Excel)", type=["csv", "xlsx"])
sales_file = st.sidebar.file_uploader("Upload Sales File (CSV or Excel)", type=["csv", "xlsx"])

# -----------------------------
# Main app logic
# -----------------------------
if stock_file and sales_file:
    stock_df = load_file(stock_file)
    sales_df = load_file(sales_file)

    if stock_df is None or sales_df is None:
        st.error("One or both files could not be read. Please upload valid CSV or Excel files.")
        st.stop()

    stock_df = clean_columns(stock_df)
    sales_df = clean_columns(sales_df)

    if not validate_stock_data(stock_df):
        st.error("Stock file is missing required columns.")
        st.info("Required stock columns: product_id, product_name, category, stock_qty, reorder_level, supplier")
        st.stop()

    if not validate_sales_data(sales_df):
        st.error("Sales file is missing required columns.")
        st.info("Required sales columns: date, product_id, product_name, qty_sold, selling_price, cashier, branch")
        st.stop()

    sales_df["date"] = pd.to_datetime(sales_df["date"], errors="coerce")
    sales_df = sales_df.dropna(subset=["date"])

    merged_df = process_data(stock_df, sales_df)

    # KPIs
    total_sales_value = (sales_df["qty_sold"] * sales_df["selling_price"]).sum()
    total_items_sold = sales_df["qty_sold"].sum()
    low_stock_count = merged_df["low_stock_alert"].sum()
    out_of_stock_count = (merged_df["current_stock"] <= 0).sum()

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Sales", f"GHS {total_sales_value:,.2f}")
    col2.metric("Total Items Sold", f"{int(total_items_sold)}")
    col3.metric("Low-Stock Items", f"{int(low_stock_count)}")
    col4.metric("Out-of-Stock Items", f"{int(out_of_stock_count)}")

    st.divider()

    # Tabs
    tab1, tab2, tab3, tab4, tab5 = st.tabs(["Dashboard", "Inventory", "Alerts", "Reorder Report", "Sales vs Purchases"])

    with tab1:
        st.subheader("Sales Dashboard")

        sales_by_product = (
            sales_df.groupby("product_name", as_index=False)["qty_sold"]
            .sum()
            .sort_values(by="qty_sold", ascending=False)
            .head(10)
        )

        fig_top_products = px.bar(
            sales_by_product,
            x="product_name",
            y="qty_sold",
            title="Top 10 Products Sold"
        )
        st.plotly_chart(fig_top_products, use_container_width=True)

        sales_by_branch = (
            sales_df.assign(sales_value=sales_df["qty_sold"] * sales_df["selling_price"])
            .groupby("branch", as_index=False)["sales_value"]
            .sum()
        )

        fig_branch_sales = px.bar(
            sales_by_branch,
            x="branch",
            y="sales_value",
            title="Sales by Branch"
        )
        st.plotly_chart(fig_branch_sales, use_container_width=True)

    with tab2:
        st.subheader("Inventory Overview")
        st.dataframe(
            merged_df[[
                "product_id", "product_name", "category", "stock_qty",
                "qty_sold", "current_stock", "reorder_level", "supplier", "stock_status"
            ]],
            use_container_width=True
        )

    with tab3:
        st.subheader("Low-Stock Alerts")
        low_stock_df = merged_df[merged_df["low_stock_alert"] == True]

        if low_stock_df.empty:
            st.success("No low-stock items found.")
        else:
            st.warning("These items need urgent attention.")
            st.dataframe(
                low_stock_df[[
                    "product_id", "product_name", "category",
                    "current_stock", "reorder_level", "supplier"
                ]],
                use_container_width=True
            )

    with tab4:
        st.subheader("Reorder Report")
        reorder_df = merged_df[merged_df["reorder_qty"] > 0][[
            "product_id", "product_name", "supplier",
            "current_stock", "reorder_level", "reorder_qty"
        ]]

        st.dataframe(reorder_df, use_container_width=True)

        csv = reorder_df.to_csv(index=False).encode("utf-8")
        st.download_button(
            label="Download Reorder Report",
            data=csv,
            file_name="reorder_report.csv",
            mime="text/csv"
        )

    with tab5:
        st.subheader("Sales vs Purchases Overview")

        sp_df = pd.DataFrame({
            "Month": ["Month 1", "Month 2", "Month 3", "Month 4"],
            "Sales": [2000, 3000, 4000, 5000],
            "Purchases": [1500, 2500, 3500, 4500],
        })

        fig_sp = go.Figure()
        fig_sp.add_trace(go.Bar(name="Sales", x=sp_df["Month"], y=sp_df["Sales"], marker_color="steelblue"))
        fig_sp.add_trace(go.Bar(name="Purchases", x=sp_df["Month"], y=sp_df["Purchases"], marker_color="coral"))
        fig_sp.update_layout(
            barmode="group",
            title="Monthly Sales vs Purchases",
            xaxis_title="Month",
            yaxis_title="Amount (GHS)",
        )
        st.plotly_chart(fig_sp, use_container_width=True)

        sp_df["Profit"] = sp_df["Sales"] - sp_df["Purchases"]
        fig_profit = px.line(sp_df, x="Month", y="Profit", markers=True, title="Monthly Profit (Sales − Purchases)")
        st.plotly_chart(fig_profit, use_container_width=True)

        st.dataframe(sp_df, use_container_width=True)

else:
    st.info("Please upload both stock and sales files to begin.")

    st.subheader("Expected Stock File Format")
    st.code(
        "product_id,product_name,category,stock_qty,reorder_level,supplier\n"
        "P001,Coca Cola,Drinks,120,50,ABC Suppliers\n"
        "P002,Bread,Bakery,40,20,Fresh Foods Ltd",
        language="csv"
    )

    st.subheader("Expected Sales File Format")
    st.code(
        "date,product_id,product_name,qty_sold,selling_price,cashier,branch\n"
        "2026-04-01,P001,Coca Cola,15,10.00,John,Accra\n"
        "2026-04-01,P002,Bread,8,12.00,Mary,Tema",
        language="csv"
    )
