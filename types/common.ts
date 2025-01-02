import type { Database } from './supabase'

export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Supabaseのレスポンス型を定義
export interface SupabaseResponse<T> {
  data: T | null
  error: Error | null
}

export interface UserProfile {
  id: string
  email: string
  name: string
  hire_date: string
  department: string
  work_hours: number
  work_days: number
}

export interface BasicInfo {
  person_name: string
  company_name: string
  address: string
  phone: string
  position: string
  writer_name: string
  relationship: string
  work_type: string
  work_hours: string
  hire_date: string
  department: string
  daily_work_hours: number
  weekly_work_days: number
}
