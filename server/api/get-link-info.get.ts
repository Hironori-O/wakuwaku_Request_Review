import { useSupabaseService } from '~/composables/useSupabase'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const linkId = query.link || query.id as string

    if (!linkId) {
      console.warn('No link ID provided')
      return {
        success: false,
        error: 'リンクIDが指定されていません'
      }
    }

    console.log('Fetching link info for:', linkId)
    const supabase = useSupabaseService()

    // リンク情報の取得
    const { data: linkData, error: linkError } = await supabase
      .from('user_links')
      .select('*')
      .eq('id', linkId)
      .maybeSingle()

    if (linkError) {
      console.error('Error fetching link:', {
        message: linkError.message,
        details: linkError.details,
        hint: linkError.hint,
        code: linkError.code
      })
      return {
        success: false,
        error: `リンク情報の取得に失敗しました: ${linkError.message}`
      }
    }

    if (!linkData) {
      console.warn('Link data not found:', linkId)
      return {
        success: false,
        error: 'リンク情報が見つかりません'
      }
    }

    console.log('Link data found:', {
      id: linkData.id,
      email: linkData.email,
      used: linkData.used,
      editable: linkData.editable
    })

    // ユーザーケース情報の取得
    const { data: caseData, error: caseError } = await supabase
      .from('user_cases')
      .select('*')
      .eq('link_id', linkId)
      .maybeSingle()

    if (caseError) {
      console.error('Error fetching case data:', {
        message: caseError.message,
        details: caseError.details,
        hint: caseError.hint,
        code: caseError.code
      })
    }

    if (caseData) {
      console.log('Case data found:', {
        id: caseData.id,
        link_id: caseData.link_id,
        status: caseData.status
      })
    }

    return {
      success: true,
      data: {
        email: linkData.email,
        isUsed: linkData.used,
        savedCase: caseData || null,
        isActive: linkData.editable !== false,
        hashtags: linkData.hashtags || []
      }
    }
  } catch (error) {
    console.error('Error getting link info:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'リンク情報の取得に失敗しました'
    }
  }
}) 