import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from './supabase'

declare module '#app' {
  interface NuxtApp {
    $supabase: SupabaseClient<Database>
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $supabase: SupabaseClient<Database>
  }
}

declare module '@nuxt/schema' {
  interface RuntimeConfig {
    supabaseServiceKey: string
    public: {
      supabaseUrl: string
      supabaseKey: string
    }
  }
}

declare module '#imports' {
  function useSupabaseUser(): Ref<User | null>
}

export {} 