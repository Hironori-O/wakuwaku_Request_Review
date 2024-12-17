import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export const useSupabase = () => {
  const config = useRuntimeConfig()

  if (!supabaseInstance && config.public.supabaseUrl && config.public.supabaseKey) {
    supabaseInstance = createClient(
      config.public.supabaseUrl,
      config.public.supabaseKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      }
    )
  }

  return {
    supabase: supabaseInstance
  }
}

// サーバーサイド用のクライアント
export const useSupabaseService = () => {
  const config = useRuntimeConfig()

  console.log('Service client config:', {
    hasUrl: !!config.public.supabaseUrl,
    hasServiceKey: !!config.supabaseServiceKey
  })

  if (!config.supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_KEY is not configured in .env file')
  }

  return createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )
} 