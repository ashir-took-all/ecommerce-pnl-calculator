-- =====================================================================
-- SUPABASE CASH FLOW & MULTI-TENANT ACCOUNT ISOLATION SCHEMA
-- =====================================================================
-- Enables multi-tenant security using PostgreSQL Row Level Security (RLS).
-- Guarantees that Brand A cannot view, query, or modify Brand B's data.

-- 1. Cash Accounts / Brand Liquidity Profile Table
CREATE TABLE IF NOT EXISTS public.cash_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_name TEXT NOT NULL DEFAULT 'Main Business Account',
    opening_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    min_cash_buffer NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
    currency_code VARCHAR(10) NOT NULL DEFAULT 'PKR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_account_per_brand UNIQUE (account_id, account_name)
);

-- 2. Cash Transactions Table
CREATE TABLE IF NOT EXISTS public.cash_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cash_account_id UUID REFERENCES public.cash_accounts(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('inflow', 'outflow')),
    category VARCHAR(60) NOT NULL,
    description TEXT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'cleared' CHECK (payment_status IN ('cleared', 'pending', 'cancelled')),
    linked_pnl_id TEXT, -- Optional link to daily P&L record without double-counting
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Cash Flow Forecasts Table
CREATE TABLE IF NOT EXISTS public.cash_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    horizon_days INT NOT NULL CHECK (horizon_days IN (7, 14, 30, 60, 90)),
    expected_inflows NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    expected_outflows NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Enable RLS on all tables
ALTER TABLE public.cash_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_forecasts ENABLE ROW LEVEL SECURITY;

-- Policies for cash_accounts: Only the authenticated account can access its own accounts
CREATE POLICY "Users can view their own cash accounts"
ON public.cash_accounts FOR SELECT
USING (auth.uid() = account_id);

CREATE POLICY "Users can insert their own cash accounts"
ON public.cash_accounts FOR INSERT
WITH CHECK (auth.uid() = account_id);

CREATE POLICY "Users can update their own cash accounts"
ON public.cash_accounts FOR UPDATE
USING (auth.uid() = account_id)
WITH CHECK (auth.uid() = account_id);

CREATE POLICY "Users can delete their own cash accounts"
ON public.cash_accounts FOR DELETE
USING (auth.uid() = account_id);

-- Policies for cash_transactions: Strict brand data isolation
CREATE POLICY "Users can view their own cash transactions"
ON public.cash_transactions FOR SELECT
USING (auth.uid() = account_id);

CREATE POLICY "Users can insert their own cash transactions"
ON public.cash_transactions FOR INSERT
WITH CHECK (auth.uid() = account_id);

CREATE POLICY "Users can update their own cash transactions"
ON public.cash_transactions FOR UPDATE
USING (auth.uid() = account_id)
WITH CHECK (auth.uid() = account_id);

CREATE POLICY "Users can delete their own cash transactions"
ON public.cash_transactions FOR DELETE
USING (auth.uid() = account_id);

-- Policies for cash_forecasts
CREATE POLICY "Users can view their own forecasts"
ON public.cash_forecasts FOR SELECT
USING (auth.uid() = account_id);

CREATE POLICY "Users can manage their own forecasts"
ON public.cash_forecasts FOR ALL
USING (auth.uid() = account_id)
WITH CHECK (auth.uid() = account_id);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_cash_tx_account_date ON public.cash_transactions(account_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_cash_tx_type ON public.cash_transactions(account_id, type);
