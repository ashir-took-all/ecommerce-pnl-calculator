# ecomP&L — E-commerce Profitability & Cash Flow Management System

A clean, editorial, manual-entry-first e-commerce Profit & Loss (P&L) calculator, Brand Performance Dashboard, and **Deterministic Cash Flow Management System**.

---

## 🧭 System Architecture & Separation of Concerns

### 1. P&L Statement (Performance)
- **Question Answered**: *"Did the business make a profit?"*
- Calculates Net Sales, COGS, Courier Costs, Ad Spend, Operating Expenses, and Net Profit.

### 2. Cash Flow Management (Liquidity)
- **Question Answered**: *"Where did the actual liquid cash go, and how much cash is available in the bank right now?"*
- Tracks actual cash settlements, customer payments, supplier cash disbursements, closing balances, and cash runway.
- **The Inventory vs COGS Rule (Zero Double-Counting)**:
  - When inventory is purchased, it is recorded as an actual **Cash Outflow** today when cash leaves the bank.
  - When inventory sells later, it is recorded as **COGS** on the P&L to calculate profit margin.
  - **Cash Flow does NOT subtract COGS again**, preventing false double-deduction.

---

## 💵 Cash Flow Formulas & Warning Rules

| Metric | Formula | Behavior |
| :--- | :--- | :--- |
| **Total Cash Inflows** | $\sum \text{Customer Cash Receipts} + \text{Settlements} + \text{Other Inflows}$ | Only cleared cash received |
| **Total Cash Outflows** | $\sum \text{Inventory Purchases} + \text{Ads Paid} + \text{Courier Paid} + \text{Bills Paid}$ | Only actual cash paid out |
| **Net Cash Flow** | $\text{Total Cash Inflows} - \text{Total Cash Outflows}$ | Period net liquidity variance |
| **Closing Cash Balance** | $\text{Opening Cash Balance} + \text{Net Cash Flow}$ | True available liquidity |
| **Projected Closing Cash** | $\text{Current Cash} + \text{Expected Inflows} - \text{Expected Outflows}$ | Deterministic 7/14/30/60/90-day forecast |
| **Cash Runway** | $\text{Closing Cash} \div \text{Average Daily Net Outflow}$ | If net cash is positive, displays *"Positive Cash Flow"*; if negative, calculates days of runway |

### Deterministic Warning Rules (User-Configured Minimum Cash Buffer)
- **Critical Alert**: If Projected Closing Cash $< 0$ ("Projected cash balance is negative.")
- **Warning Alert**: If Projected Closing Cash $<$ Minimum Buffer ("Projected cash balance is approaching your minimum cash buffer.")
- **Healthy Status**: If Projected Closing Cash $\ge$ Minimum Buffer ("Your projected cash balance remains above your minimum buffer.")

---

## 🗄️ Multi-Tenant Backend & Security Architecture

The schema in `supabase_cashflow_schema.sql` establishes strict tenant isolation:
- Table `cash_accounts`: Tracks brand accounts, opening cash, and minimum buffers.
- Table `cash_transactions`: Logs every inflow and outflow transaction.
- **PostgreSQL Row Level Security (RLS)** is enabled on all tables:
  ```sql
  CREATE POLICY "Users can only manage their own cash transactions"
  ON public.cash_transactions FOR ALL
  USING (auth.uid() = account_id)
  WITH CHECK (auth.uid() = account_id);
  ```
  Guarantees that no brand account can ever read or modify another account's financial transactions.
