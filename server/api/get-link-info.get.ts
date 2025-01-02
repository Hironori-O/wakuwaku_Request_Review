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
        caseData,
        basic_info: caseData?.basic_info,
        basic_info_raw: JSON.stringify(caseData?.basic_info, null, 2),
        basic_info_keys: caseData?.basic_info ? Object.keys(caseData.basic_info) : [],
        basic_info_values: caseData?.basic_info ? Object.entries(caseData.basic_info).map(([key, value]) => ({
          field: key,
          type: typeof value,
          value: value
        })) : [],
        episode: caseData?.episode,
        episode_type: typeof caseData?.episode
      })
    }

    console.log('Retrieved case data:', {
      caseData,
      basic_info: caseData?.basic_info,
      episode: caseData?.episode
    })

    // 返却データのログを追加
    const returnData = {
      success: true,
      data: {
        email: linkData.email,
        isUsed: linkData.used,
        savedCase: {
          ...caseData,
          basic_info: {
            ...caseData?.basic_info,
            hire_date: caseData?.basic_info?.hire_date || '',
            department: caseData?.basic_info?.department || '',
            daily_work_hours: caseData?.basic_info?.daily_work_hours || '',
            weekly_work_days: caseData?.basic_info?.weekly_work_days || ''
          },
          episode: caseData?.episode || ''
        },
        isActive: linkData.editable !== false,
        hashtags: linkData.hashtags || []
      }
    }

    console.log('Returning data structure:', {
      savedCase: returnData.data.savedCase,
      basic_info_keys: Object.keys(returnData.data.savedCase?.basic_info || {}),
      basic_info_values: returnData.data.savedCase?.basic_info
    })

    return returnData
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