-- =====================================================================
-- COMPLETE SUPABASE SCHEMA & MULTI-TENANT ISOLATION FOR ECOM P&L
-- =====================================================================
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- It creates all tables, enables Row Level Security (RLS), configures policies,
-- and adds automatic profile creation upon user signup.

-- Enable UUID extension (enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 1. PROFILES & BRAND CONFIGURATION TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    brand_name TEXT NOT NULL DEFAULT 'My Brand',
    currency_code VARCHAR(10) NOT NULL DEFAULT 'PKR',
    currency_symbol VARCHAR(10) NOT NULL DEFAULT 'Rs',
    opening_cash NUMERIC(15, 2) NOT NULL DEFAULT 250000.00,
    min_cash_buffer NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
    forecast_horizon INT NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 2. DAILY P&L RECORDS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.daily_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    store VARCHAR(80) NOT NULL DEFAULT 'Shopify Store',
    gross_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    returns_discounts NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    orders_placed INT NOT NULL DEFAULT 0,
    orders_delivered INT NOT NULL DEFAULT 0,
    product_cogs NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    courier_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    packaging_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    return_shipping_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    ad_spend NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    agency_influencer NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    other_expenses NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    net_revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_expenses NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    net_profit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    net_margin NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_record_date UNIQUE (user_id, date)
);

-- =====================================================================
-- 3. PRODUCTS (SKU ECONOMICS & BULK INVENTORY) TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'General',
    icon VARCHAR(10) NOT NULL DEFAULT '📦',
    revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    cogs NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    ads NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    profit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    margin NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 4. CASH TRANSACTIONS TABLE (CASH FLOW SYSTEM)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.cash_transactions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('inflow', 'outflow')),
    category VARCHAR(80) NOT NULL,
    description TEXT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'cleared' CHECK (payment_status IN ('cleared', 'pending', 'cancelled')),
    linked_pnl_id TEXT REFERENCES public.daily_records(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- 5. AUTOMATIC USER PROFILE TRIGGER (ON SIGNUP)
-- =====================================================================
-- Automatically creates a profile record in public.profiles when a user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, brand_name)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'brand_name', 'My Brand'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
-- Enforce strict data isolation at the database engine level.
-- auth.uid() returns the authenticated user's ID from the JWT token.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Daily Records Policies
CREATE POLICY "Users can view own daily records"
    ON public.daily_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily records"
    ON public.daily_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily records"
    ON public.daily_records FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily records"
    ON public.daily_records FOR DELETE
    USING (auth.uid() = user_id);

-- Products Policies
CREATE POLICY "Users can view own products"
    ON public.products FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
    ON public.products FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
    ON public.products FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
    ON public.products FOR DELETE
    USING (auth.uid() = user_id);

-- Cash Transactions Policies
CREATE POLICY "Users can view own cash transactions"
    ON public.cash_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cash transactions"
    ON public.cash_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cash transactions"
    ON public.cash_transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cash transactions"
    ON public.cash_transactions FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================================
-- 7. PERFORMANCE INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_records_user_date ON public.daily_records(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_products_user ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_tx_user_date ON public.cash_transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_cash_tx_user_type ON public.cash_transactions(user_id, type);
