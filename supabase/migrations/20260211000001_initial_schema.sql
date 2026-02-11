-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7280',
  icon_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT categories_name_length CHECK (char_length(name) BETWEEN 1 AND 50),
  CONSTRAINT categories_color_format CHECK (color ~* '^#[0-9A-F]{6}$'),
  CONSTRAINT categories_user_name_unique UNIQUE (user_id, name)
);

CREATE INDEX idx_categories_user_id ON public.categories(user_id);

COMMENT ON TABLE public.categories IS 'User-defined categories for organizing transactions';
COMMENT ON COLUMN public.categories.icon_id IS 'Optional icon identifier for UI rendering (e.g., heroicons name)';

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT transactions_amount_positive CHECK (amount > 0),
  CONSTRAINT transactions_amount_max CHECK (amount <= 999999999.99),
  CONSTRAINT transactions_type_valid CHECK (type IN ('income', 'expense')),
  CONSTRAINT transactions_description_length CHECK (char_length(description) BETWEEN 1 AND 500)
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_category ON public.transactions(user_id, category_id);
CREATE INDEX idx_transactions_user_type ON public.transactions(user_id, type);
CREATE INDEX idx_transactions_description_gin ON public.transactions USING gin(to_tsvector('english', description));

COMMENT ON TABLE public.transactions IS 'Financial transactions (income and expenses) with optional category assignment';
COMMENT ON COLUMN public.transactions.amount IS 'Transaction amount in currency units (max 999,999,999.99 with 2 decimal places)';
COMMENT ON COLUMN public.transactions.description IS 'User-provided description of the transaction';
COMMENT ON COLUMN public.transactions.date IS 'Transaction date in UTC (displayed in user timezone)';
COMMENT ON COLUMN public.transactions.type IS 'Transaction type: income or expense';

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
