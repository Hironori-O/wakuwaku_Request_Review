import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

// クライアントサイド用のフック
export const useSupabase = () => {
  const nuxtApp = useNuxtApp()
  const { $supabase } = nuxtApp
  if (!$supabase) {
    throw new Error('Supabase client is not initialized')
  }
  return $supabase as SupabaseClient<Database>
}

// サーバーサイド用のクライアント
export const useSupabaseService = () => {
  const config = useRuntimeConfig()

  if (!config.supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_KEY is missing in environment variables')
    throw new Error('SUPABASE_SERVICE_KEY is required for server-side operations')
  }

  try {
    return createClient<Database>(
      config.public.supabaseUrl as string,
      config.supabaseServiceKey as string,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )
  } catch (error) {
    console.error('Failed to initialize Supabase service client:', error)
    throw error
  }
} 