import { createTransport } from 'nodemailer'
import { google } from 'googleapis'

interface EmailRequest {
  to: string
  url: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  try {
    const body = await readBody(event) as EmailRequest

    // OAuth2クライアントの設定
    const oauth2Client = new google.auth.OAuth2(
      config.gmailClientId,
      config.gmailClientSecret,
      'https://developers.google.com/oauthplayground'
    )

    oauth2Client.setCredentials({
      refresh_token: config.gmailRefreshToken
    })

    // アクセストークンの取得
    const accessToken = await oauth2Client.getAccessToken()

    // メール送信の設定
    const transporter = createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: config.gmailUser,
        clientId: config.gmailClientId,
        clientSecret: config.gmailClientSecret,
        refreshToken: config.gmailRefreshToken,
        accessToken: accessToken.token || ''
      }
    })

    // メールの内容
    const mailOptions = {
      from: `就労状況登録システム <${config.gmailUser}>`,
      to: body.to,
      subject: '就労状況登録フォームのご案内',
      text: `
以下のURLから就労状況の登録をお願いいたします。

${body.url}

このURLは一度のみ有効です。
`,
      html: `
<p>以下のURLから就労状況の登録をお願いいたします。</p>
<p><a href="${body.url}">${body.url}</a></p>
<p>このURLは一度のみ有効です。</p>
`
    }

    // メールを送信
    await transporter.sendMail(mailOptions)

    return {
      success: true
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'メールの送信に失敗しました'
    }
  }
}) 