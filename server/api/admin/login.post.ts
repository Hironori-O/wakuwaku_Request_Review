import { H3Event } from 'h3'

// 環境変数から管理者認証情報を取得
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)
    const { username, password } = body

    // 認証情報の検証
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // 認証トークンを設定
      setCookie(event, 'admin-auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 // 1時間
      })

      return {
        success: true
      }
    }

    return {
      success: false,
      error: 'ユーザー名またはパスワードが正しくありません'
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'ログイン処理に失敗しました'
    }
  }
}) 