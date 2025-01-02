// 一時的に使用しないためコメントアウト
/*
import { createTransport } from 'nodemailer'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { to, subject, text } = body

  try {
    const transporter = createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: true,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass
      }
    })

    await transporter.sendMail({
      from: config.smtpUser,
      to,
      subject,
      text
    })

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
*/ 