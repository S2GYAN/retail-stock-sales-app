This repository holds two separate projects:

- **Retail Stock & Sales Automation App** — a Streamlit tool, documented below.
- **[M-Touch Ventures](./m-touch-ventures)** — an Expo (React Native) mobile app
  for a prepaid electricity (ECG) vendor in Ghana to track daily purchases,
  sales, commission, and float balance. See
  [`m-touch-ventures/README.md`](./m-touch-ventures/README.md).

---

# Retail Stock & Sales Automation App

## Files
- `app.py` - main Streamlit app
- `requirements.txt` - Python dependencies
- `sample_stock.csv` - sample stock data
- `sample_sales.csv` - sample sales data

## How to run
```bash
pip install -r requirements.txt
streamlit run app.py
```

## What it does
- Upload stock and sales files
- Calculate current stock
- Flag low-stock items
- Show sales KPIs
- Generate reorder suggestions
- Download reorder report
