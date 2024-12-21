import { useSupabaseUser } from '#imports'
import { useSupabaseService } from '~/composables/useSupabase'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const client = useSupabaseService()

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
}) 