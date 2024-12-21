import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const useSupabase = () => {
  const { $supabase } = useNuxtApp()
  return {
    supabase: $supabase as SupabaseClient<Database>
  }
}

// サーバーサイド用のクライアント
export const useSupabaseService = () => {
  const config = useRuntimeConfig()

  if (!config.supabaseServiceKey) {
    console.error('SUPABASE_SERVICE_KEY is missing in environment variables')
    throw new Error('SUPABASE_SERVICE_KEY is required for server-side operations')
  }

  return createClient<Database>(
    config.public.supabaseUrl,
    config.supabaseServiceKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  )
} 