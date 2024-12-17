import { useSupabase } from '~/composables/useSupabase'

export default defineNuxtRouteMiddleware(async (to) => {
  // ログインページはチェックをスキップ
  if (to.path === '/admin/login') {
    return
  }

  const supabase = useSupabase().supabase
  if (!supabase) {
    return navigateTo('/admin/login')
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return navigateTo('/admin/login')
    }

    // 管理者権限の確認
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select()
      .eq('id', user.id)
      .single()

    if (adminError || !adminData) {
      await supabase.auth.signOut()
      return navigateTo('/admin/login')
    }

    // /admin にアクセスした場合は /admin/dashboard にリダイレクト
    if (to.path === '/admin') {
      return navigateTo('/admin/dashboard')
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return navigateTo('/admin/login')
  }
}) 