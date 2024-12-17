import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // 認証クッキーをチェック
    const authCookie = getCookie(event, 'admin-auth')
    
    return {
      success: authCookie === 'true'
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return {
      success: false,
      error: '認証チェックに失敗しました'
    }
  }
}) 