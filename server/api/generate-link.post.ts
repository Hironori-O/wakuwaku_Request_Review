import { createClient } from '@supabase/supabase-js'

interface LinkRequest {
  email: string
  hashtags: string[]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  try {
    const body = await readBody(event) as LinkRequest
    console.log('Received request:', body)

    // リンク情報をデータベースに保存
    const { data: linkData, error: linkError } = await supabase
      .from('user_links')
      .insert({
        email: body.email,
        hashtags: body.hashtags,
        used: false,
        status: 'pending'
      })
      .select()
      .single()

    if (linkError) {
      console.error('Error generating link:', {
        message: linkError.message,
        details: linkError.details,
        hint: linkError.hint,
        code: linkError.code
      })
      throw new Error(`リンクの生成に失敗しました: ${linkError.message}`)
    }

    // 生成されたリンクを返す
    const baseUrl = config.public.baseUrl || 'http://localhost:3000'
    const userPageUrl = `${baseUrl}/user/form?link=${linkData.id}`

    console.log('Link generated successfully:', {
      id: linkData.id,
      email: linkData.email,
      url: userPageUrl,
      data: linkData
    })

    return {
      success: true,
      userPageUrl,
      debug: linkData
    }
  } catch (error) {
    console.error('Error generating link:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'リンクの生成に失敗しました'
    }
  }
}) 