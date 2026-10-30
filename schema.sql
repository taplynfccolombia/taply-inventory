-- ====================================================================
-- TAPLY INVENTORY — ESQUEMA COMPLETO DE BASE DE DATOS (SUPABASE)
-- ====================================================================

-- 1. Tabla: Clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  city TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabla: Perfiles NFC Públicos (/p/[slug])
CREATE TABLE IF NOT EXISTS public.nfc_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  tagline TEXT,
  company TEXT,
  avatar_url TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  tiktok TEXT,
  linkedin TEXT,
  facebook TEXT,
  youtube TEXT,
  location TEXT,
  google_reviews_url TEXT,
  custom_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  views INTEGER NOT NULL DEFAULT 0,
  template TEXT NOT NULL DEFAULT 'oscuro',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabla: Inventario
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT UNIQUE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabla: Logs de Movimiento de Inventario
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  change_type TEXT NOT NULL CHECK (change_type IN ('add', 'subtract', 'sale', 'cancel')),
  quantity_change INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  notes TEXT
);

-- 5. Tabla: Ventas
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  product_type TEXT NOT NULL DEFAULT 'custom' CHECK (product_type IN ('custom', 'essential')),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  total_profit NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'efectivo' CHECK (payment_method IN ('efectivo', 'transferencia', 'nequi', 'daviplata', 'otro')),
  status TEXT NOT NULL DEFAULT 'completada' CHECK (status IN ('completada', 'pendiente', 'cancelada')),
  order_status TEXT NOT NULL DEFAULT 'recibido' CHECK (order_status IN ('recibido', 'en_produccion', 'listo', 'enviado', 'entregado')),
  notes TEXT,
  sale_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tabla: Flujo de Caja (Ingresos / Egresos manuales)
CREATE TABLE IF NOT EXISTS public.cash_flow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('ingreso', 'egreso')),
  category TEXT NOT NULL DEFAULT 'otro',
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  reference_id UUID,
  flow_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Tabla: Tareas
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('alta', 'media', 'baja')),
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Tabla: Metas Mensuales
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  target_revenue NUMERIC NOT NULL DEFAULT 0,
  target_sales INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (month, year)
);

-- 9. RPC Function: Contador de Vistas de Perfil NFC
CREATE OR REPLACE FUNCTION public.increment_profile_views(profile_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.nfc_profiles
  SET views = views + 1
  WHERE slug = profile_slug;
END;
$$;

-- 10. Item base de inventario (si no existe)
INSERT INTO public.inventory (item_name, quantity, cost_per_unit)
VALUES ('Tarjeta Negra Matte Base', 0, 21200)
ON CONFLICT (item_name) DO NOTHING;


-- ====================================================================
-- 11. POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ====================================================================

-- Activar RLS en todas las tablas
ALTER TABLE public.nfc_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- 11.1 nfc_profiles: lectura pública para perfiles activos, control total para Admin autenticado
DROP POLICY IF EXISTS "Perfiles públicos activos son visibles para todos" ON public.nfc_profiles;
CREATE POLICY "Perfiles públicos activos son visibles para todos" ON public.nfc_profiles
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin tiene control total de nfc_profiles" ON public.nfc_profiles;
CREATE POLICY "Admin tiene control total de nfc_profiles" ON public.nfc_profiles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 11.2 Tablas privadas: acceso exclusivo para Admin autenticado
DROP POLICY IF EXISTS "Admin control clients" ON public.clients;
CREATE POLICY "Admin control clients" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin control sales" ON public.sales;
CREATE POLICY "Admin control sales" ON public.sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin control inventory" ON public.inventory;
CREATE POLICY "Admin control inventory" ON public.inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin control inventory_logs" ON public.inventory_logs;
CREATE POLICY "Admin control inventory_logs" ON public.inventory_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin control cash_flow" ON public.cash_flow;
CREATE POLICY "Admin control cash_flow" ON public.cash_flow FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin control tasks" ON public.tasks;
CREATE POLICY "Admin control tasks" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin control goals" ON public.goals;
CREATE POLICY "Admin control goals" ON public.goals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 11.3 Storage: bucket 'nfc-avatars'
DROP POLICY IF EXISTS "Avatares públicos visibles para todos" ON storage.objects;
CREATE POLICY "Avatares públicos visibles para todos" ON storage.objects
  FOR SELECT USING (bucket_id = 'nfc-avatars');

DROP POLICY IF EXISTS "Admin puede subir y gestionar avatares" ON storage.objects;
CREATE POLICY "Admin puede subir y gestionar avatares" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'nfc-avatars') WITH CHECK (bucket_id = 'nfc-avatars');
