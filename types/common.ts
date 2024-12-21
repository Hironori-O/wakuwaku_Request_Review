import type { Database } from '@/types/supabase'

export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

// Supabaseのレスポンス型を定義
export interface SupabaseResponse<T> {
  data: T | null
  error: Error | null
}
