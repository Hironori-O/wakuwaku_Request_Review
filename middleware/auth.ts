import { useSupabase } from '~/composables/useSupabase'
import type { SupabaseClient } from '@supabase/supabase-js'

export default defineNuxtRouteMiddleware(async (to) => {
  const { supabase } = useSupabase()

  if (!supabase) {
    console.error('Supabase client is not initialized')
    return navigateTo('/admin/login')
  }

  const client: SupabaseClient = supabase

  try {
    // メール認証後のリダイレクトを処理
    const {
      data: { session },
      error: sessionError
    } = await client.auth.getSession()

    // エラーハンドリング
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw new Error('認証エラーが発生しました')
    }

    // 管理者ページへのアクセス制御
    if (to.path.startsWith('/admin')) {
      // ログインページとパスワードリセットページは除外
      if (to.path === '/admin/login' || to.path === '/admin/reset-password') {
        if (session) {
          // すでにログインしている場合はダッシュボードへ
          return navigateTo('/admin/dashboard')
        }
        return
      }

      // 未ログインの場合はログインページへ
      if (!session) {
        return navigateTo('/admin/login')
      }

      try {
        // 管理者権限の確認
        const { data: adminData, error: adminError } = await client
          .from('admin_users')
          .select()
          .eq('id', session.user.id)
          .single()

        if (adminError) {
          console.error('Admin check error:', adminError)
          throw new Error('管理者権限の確認に失敗しました')
        }

        if (!adminData) {
          console.warn('No admin privileges found for user:', session.user.id)
          await client.auth.signOut()
          return navigateTo('/admin/login')
        }
      } catch (error) {
        console.error('Error checking admin privileges:', error)
        await client.auth.signOut()
        return navigateTo('/admin/login')
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return navigateTo('/admin/login')
  }
})