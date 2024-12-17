import { useSupabase } from '~/composables/useSupabase'

export default defineNuxtPlugin(() => {
  const { supabase } = useSupabase()

  return {
    provide: {
      supabase
    }
  }
})
