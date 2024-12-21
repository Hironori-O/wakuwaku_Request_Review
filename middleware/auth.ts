import { useSupabaseUser } from '#imports'
import { useSupabaseService } from '~/composables/useSupabase'
import type { SupabaseClient } from '@supabase/supabase-js'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const client = useSupabaseService()

  // 管理者ページへのアクセス制御
  if (to.path.startsWith('/admin')) {
    if (to.path === '/admin/login') {
      return
    }

    if (!user.value) {
      return navigateTo('/admin/login')
    }

    // 管理者権限の確認
    const { data: profile } = await client
      .from('profiles')
      .select('role')
      .eq('id', user.value.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return navigateTo('/admin/login')
    }
  } else if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})