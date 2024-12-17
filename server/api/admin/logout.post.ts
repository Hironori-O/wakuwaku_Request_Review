import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // 認証クッキーを削除
    deleteCookie(event, 'admin-auth', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    return {
      success: true
    }
  } catch (error) {
    console.error('Logout error:', error)
    return {
      success: false,
      error: 'ログアウト処理に失敗しました'
    }
  }
}) 