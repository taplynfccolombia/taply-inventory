import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Tipos del sistema Taply ──────────────────────────────────────

export type ProductType = 'essential' | 'custom'
export type PaymentMethod = 'efectivo' | 'transferencia' | 'nequi' | 'daviplata' | 'otro'
export type SaleStatus = 'completada' | 'pendiente' | 'cancelada'
export type CashFlowType = 'ingreso' | 'egreso'

export interface Inventory {
  id: string
  item_name: string
  quantity: number
  cost_per_unit: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  company: string | null
  city: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  client_id: string | null
  product_type: ProductType
  quantity: number
  unit_price: number
  unit_cost: number
  total_revenue: number
  total_cost: number
  total_profit: number
  payment_method: PaymentMethod
  status: SaleStatus
  notes: string | null
  sale_date: string
  created_at: string
  updated_at: string
  client?: Client
}

export interface CashFlow {
  id: string
  type: CashFlowType
  category: string
  description: string
  amount: number
  reference_id: string | null
  flow_date: string
  created_at: string
  updated_at: string
}

// ── Precios y costos de productos ────────────────────────────────

export const PRODUCT_CONFIG = {
  essential: {
    label: 'Taply Essential',
    unit_price: 100000,
    unit_cost: 2000,
  },
  custom: {
    label: 'Taply Custom',
    unit_price: 130000,
    unit_cost: 21200,
  },
} as const
