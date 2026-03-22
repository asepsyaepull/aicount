-- Aicount PWA - Supabase Database Schema

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create families table
CREATE TABLE public.families (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invite_code VARCHAR(10) UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create users table (Extends Supabase Auth Auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  avatar_initials VARCHAR(2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create wallets table
CREATE TABLE public.wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('cash', 'bank', 'ewallet')),
  balance DECIMAL(15, 2) DEFAULT 0,
  color VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create categories table
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('income', 'expense')),
  icon VARCHAR(50),
  is_default BOOLEAN DEFAULT false
);

-- 6. Create transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
  destination_wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
  type VARCHAR(50) CHECK (type IN ('income', 'expense', 'transfer')),
  amount DECIMAL(15, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create budgets table
CREATE TABLE public.budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  amount_limit DECIMAL(15, 2) NOT NULL DEFAULT 0,
  month_year VARCHAR(7) NOT NULL, -- Format: MM-YYYY
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, category_id, month_year)
);

-- ==========================================
-- PostgreSQL Trigger: Atomic Wallet Update
-- ==========================================
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Jika menghapus atau mengedit transaksi lama (Kembalikan saldo seperti semula)
  IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
    IF (OLD.type = 'income') THEN
      UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.wallet_id;
    ELSIF (OLD.type = 'expense') THEN
      UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
    ELSIF (OLD.type = 'transfer') THEN
      UPDATE public.wallets SET balance = balance + OLD.amount WHERE id = OLD.wallet_id;
      IF (OLD.destination_wallet_id IS NOT NULL) THEN
        UPDATE public.wallets SET balance = balance - OLD.amount WHERE id = OLD.destination_wallet_id;
      END IF;
    END IF;
  END IF;

  -- 2. Jika menambah atau menyimpan hasil edit transaksi baru (Terapkan saldo baru)
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    IF (NEW.type = 'income') THEN
      UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.wallet_id;
    ELSIF (NEW.type = 'expense') THEN
      UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
    ELSIF (NEW.type = 'transfer') THEN
      UPDATE public.wallets SET balance = balance - NEW.amount WHERE id = NEW.wallet_id;
      IF (NEW.destination_wallet_id IS NOT NULL) THEN
        UPDATE public.wallets SET balance = balance + NEW.amount WHERE id = NEW.destination_wallet_id;
      END IF;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS transaction_wallet_update ON public.transactions;
CREATE TRIGGER transaction_wallet_update
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

-- ==========================================
-- Triggers: Auto-Create User Profile & Family
-- ==========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_family_id UUID;
BEGIN
  -- Create new family for the user
  INSERT INTO public.families DEFAULT VALUES RETURNING id INTO new_family_id;
  
  -- Insert into public.users
  INSERT INTO public.users (id, family_id, role, name, email, avatar_initials)
  VALUES (
    NEW.id,
    new_family_id,
    'admin',
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    UPPER(LEFT(NEW.email, 2))
  );

  -- Insert default wallet
  INSERT INTO public.wallets (family_id, name, type, balance, color)
  VALUES (new_family_id, 'Cash', 'cash', 0, 'emerald');

  -- Insert default categories
  INSERT INTO public.categories (family_id, name, type, icon, is_default)
  VALUES 
    (new_family_id, 'Food & Drink', 'expense', '🍔', true),
    (new_family_id, 'Transport', 'expense', '🚗', true),
    (new_family_id, 'Shopping', 'expense', '🛍️', true),
    (new_family_id, 'Salary', 'income', '💰', true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- Row Level Security (RLS) policies
-- ==========================================
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Admins and members can access data matching their family_id.
-- (Simplified RLS rule: User can see all rows where family_id = user's family_id)
CREATE OR REPLACE FUNCTION auth_user_family_id() RETURNS UUID AS $$
  SELECT family_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Users can view their own family data" ON public.wallets
  FOR ALL USING (family_id = auth_user_family_id());
  
CREATE POLICY "Users can view their own family data" ON public.categories
  FOR ALL USING (family_id = auth_user_family_id());

CREATE POLICY "Users can view their own family data" ON public.transactions
  FOR ALL USING (family_id = auth_user_family_id());

CREATE POLICY "Users can view their own family data" ON public.budgets
  FOR ALL USING (family_id = auth_user_family_id());

CREATE POLICY "Users can view family members" ON public.users
  FOR ALL USING (family_id = auth_user_family_id());
