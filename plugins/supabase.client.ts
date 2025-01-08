import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  // �定値の存在確認
  if (!config.public.supabaseUrl || !config.public.supabaseKey) {
    console.error('Supabase configuration is missing')
    throw new Error('Supabase configuration is missing')
  }

  // すでに$supabaseが存在する場合は、新しいインスタンスを作成しない
  if (!nuxtApp.$supabase) {
    const supabase = createClient<Database>(
      config.public.supabaseUrl as string,
      config.public.supabaseKey as string,
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
  }
})
