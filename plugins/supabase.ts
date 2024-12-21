import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  // 設定値の存在確認
  if (!config.public.supabaseUrl || !config.public.supabaseKey) {
    console.error('Supabase configuration is missing')
    throw new Error('Supabase configuration is missing')
  }

  const supabase = createClient<Database>(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    }
  )

  return {
    provide: {
      supabase
    }
  }
}) 