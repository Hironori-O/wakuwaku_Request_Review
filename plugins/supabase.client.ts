import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  // すでに$supabaseが存在する場合は、新しいインスタンスを作成しない
  if (!nuxtApp.$supabase) {
    const supabase = createClient<Database>(
      config.public.supabaseUrl,
      config.public.supabaseKey
    )

    return {
      provide: {
        supabase
      }
    }
  }
})
