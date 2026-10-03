# ProfitPulse — E-commerce Profit & Loss Calculator

A polished, extremely simple, general-purpose e-commerce Profit & Loss (P&L) and Cash Flow calculator web application. Designed for direct manual entry in under two minutes per day, with zero external integrations, zero API keys, and 100% client-side privacy.

---

## 🚀 Key Highlights & Philosophy

- **Manual-Entry-First**: Works for any store (Shopify, WooCommerce, TikTok Shop, Amazon, Etsy), any country, currency, ad platform (Meta, Google, TikTok, Snapchat), courier, or agency.
- **Strict Separation of P&L vs. Cash Flow**:
  - **P&L (Performance)**: Accounts for economic expenses incurred (Ad Spend, Courier Cost, COGS) against Net Sales earned.
  - **Cash Flow (Liquidity)**: Tracks actual money moving into or out of bank accounts (Cash In from customer card deposits & COD remittances vs. Cash Out for Meta ad bills, courier invoices, and bulk supplier wires).
  - **Anti-Double-Counting**: Never subtracts both Ad Spend and Meta cash payments from Net Profit. Unpaid or prepaid balances are automatically surfaced in dedicated reconciliation cards.
- **Lightning-Fast Daily Entry (< 2 Minutes)**:
  - **Quick Mode**: Enter just 5 numbers (Net Sales, Ad Spend, Total Costs, Cash In, Cash Out).
  - **Itemized Mode**: Full operational breakdown across Sales & Volume, Fulfillment, Marketing & Creative, and Operating Overhead.
  - **⚡ Apply Defaults**: Auto-computes packaging and agency fee rules at the touch of a button.
  - **Dynamic Line Items**: Add custom expenses or income items on the fly.
  - **Real-Time Calculation Bar**: Immediate preview of Net Sales, Total Costs, Net Profit, Margin %, and Net Cash Flow as you type.
- **P&L Statement with Drilldown**:
  - Period-over-period comparative view (This Period vs. Previous Period with Change $ and % of Revenue).
  - Click any category line to view every individual daily entry contributing to that figure.
- **Visual Analytics (100% Offline SVG)**:
  - Daily trend chart for Revenue, Costs, and Net Profit.
  - Sales vs. Meta Ad Spend comparison.
  - Operational expense breakdown donut chart.
  - Fulfillment funnel (Delivered, In Transit, RTO, Returned, Cancelled).
- **Data Portability & Management**:
  - Full localStorage persistence.
  - Export CSV for Daily Entries, P&L Statement, and Cash Flow Statement.
  - Realistic 14-day Demo Data generator and Reset capability.
  - Complete Activity & Audit log.

---

## 🧮 Financial Formulas & Calculation Rules

| Metric | Formula | Notes |
| :--- | :--- | :--- |
| **Gross Sales** | Top-line sales before discounts or refunds | Directly entered from store report |
| **Net Sales** | `Gross Sales - Discounts - Refunds` | Core revenue baseline |
| **Delivered Revenue** | `Net Sales × (Orders Delivered ÷ Orders Placed)` | Revenue from delivered orders. Labeled as estimate if not overridden |
| **Total Fulfillment Cost** | `COGS + Packaging + Courier Delivery + Return Shipping + RTO Courier Cost + Gateway Fees + Other Fulfillment` | Direct cost of delivering goods |
| **Total Marketing Cost** | `Ad Spend + Agency Fee + Influencer/Creative + Other Marketing` | Total marketing demand-generation expense |
| **Total Operating Cost** | `Salary + Rent + Software + Bank Charges + Other Overhead` | Business fixed overheads |
| **Net Profit** | `Net Sales + Shipping Charged + COD Income + Other Income - Total Fulfillment - Total Marketing - Total Operating` | True economic bottom line |
| **Profit Margin %** | `(Net Profit ÷ Net Sales) × 100` | Standard margin on sales |
| **Blended ROAS** | `Net Sales ÷ Total Ad Spend` | Return on advertising dollars |
| **CPA / Cost per Order** | `Ad Spend ÷ Orders Placed` (or Attributed Purchases) | Customer acquisition cost |
| **Delivery Rate** | `(Orders Delivered ÷ Orders Placed) × 100` | Percentage of successfully delivered shipments |
| **Return / RTO Rate** | `((Orders Returned + Orders RTO) ÷ Orders Placed) × 100` | Lost shipment percentage |
| **Net Cash Flow** | `Total Cash In - Total Cash Out` | Net liquidity variance for period |

---

## 🛡️ Anti-Double-Counting Rules & Reconciliations

1. **Meta Ads**:
   - `Ad Spend` is charged to P&L.
   - `Payment to Meta` is recorded purely under Cash Out (Cash Flow).
   - If `Ad Spend > Meta Payment`, the difference is shown as **Unpaid Meta Balance**.
   - If `Meta Payment > Ad Spend`, it is shown as **Prepaid Meta Wallet**.
2. **Couriers**:
   - `Courier Delivery + Return + RTO Costs` impact P&L.
   - `Payment to Courier` impacts Cash Flow.
3. **Suppliers**:
   - `Product COGS` impacts P&L as orders are sold.
   - `Payment to Supplier` (bulk inventory wire) impacts Cash Flow when cash leaves the bank.

---

## 📂 Project Structure

```text
ecommerce-pnl-calculator/
├── index.html        # App layout, dashboard, tabs, modals, tables, and forms
├── styles.css        # Responsive SaaS light-mode design system with financial colors
├── app.js            # Reactive financial engine, SVG charts, CSV exports & demo data
└── README.md         # Comprehensive documentation & accounting guidelines
```

---

## 🖥️ How to Run the Web App

The application runs directly in any modern web browser (Edge, Chrome, Firefox, Safari, Brave, Opera) with **zero dependencies**, **no build steps**, and **no server required**.

### Option 1: Open Directly
Double-click `index.html` or open it in your browser:
```text
file:///C:/Users/Admin/.gemini/antigravity/scratch/ecommerce-pnl-calculator/index.html
```

### Option 2: Run via Local HTTP Server (Optional)
From PowerShell:
```powershell
# Open default browser directly to the file
Start-Process "C:\Users\Admin\.gemini\antigravity\scratch\ecommerce-pnl-calculator\index.html"
```
