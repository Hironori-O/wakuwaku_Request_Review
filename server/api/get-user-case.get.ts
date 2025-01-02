// 一時的に使用しないためコメントアウト
/*
import { useSupabaseService } from '~/composables/useSupabase'

export default defineEventHandler(async (event) => {
  // サーバーサイドのSupabaseクライアントを取得
  const supabase = useSupabaseService()

  try {
    const query = getQuery(event)
    const caseId = query.id as string

    // APIが呼び出されたことを確認
    console.log('get-user-case.get.ts called with ID:', caseId)

    if (!caseId) {
      throw new Error('ケースIDが指定されていません')
    }

    // ケース情報の取得
    const { data: caseData, error: caseError } = await supabase
      .from('user_cases')
      .select('*')
      .eq('id', caseId)
      .single()

    // データ取得結果を確認
    console.log('Case data fetch result:', {
      hasError: !!caseError,
      hasData: !!caseData,
      caseData
    })

    if (caseError) {
      console.error('Error fetching case:', caseError)
      throw new Error('ケースの取得に失敗しました')
    }

    if (!caseData) {
      throw new Error('ケースが見つかりません')
    }

    // データ取得直後にログ出力
    console.log('Retrieved case data:', {
      basic_info: caseData.basic_info,
      basic_info_raw: JSON.stringify(caseData.basic_info, null, 2),
      basic_info_keys: Object.keys(caseData.basic_info),
      basic_info_values: Object.entries(caseData.basic_info).map(([key, value]) => ({
        field: key,
        type: typeof value,
        value: value
      }))
    })

    // basic_infoの内容を確認するログを追加
    console.log('Retrieved basic_info:', {
      basic_info: caseData?.basic_info,
      raw: JSON.stringify(caseData?.basic_info, null, 2)
    })

    // ハッシュタグの取得
    const { data: hashtagRelations, error: hashtagError } = await supabase
      .from('case_hashtags')
      .select('hashtag_id')
      .eq('case_id', caseId)

    if (hashtagError) {
      console.error('Error fetching hashtag relations:', hashtagError)
      throw new Error('ハッシュタグの取得に失敗しました')
    }

    const hashtagIds = hashtagRelations.map((relation: { hashtag_id: string }) => relation.hashtag_id)

    const { data: hashtags, error: hashtagsError } = await supabase
      .from('hashtags')
      .select('*')
      .in('id', hashtagIds)

    if (hashtagsError) {
      console.error('Error fetching hashtags:', hashtagsError)
      throw new Error('ハッシュタグの取得に失敗しました')
    }

    // 必要に応じて、デフォルト値を設定
    if (caseData?.basic_info) {
      caseData.basic_info = {
        ...caseData.basic_info,
        // hire_date: caseData.basic_info.hire_date || '',
        // department: caseData.basic_info.department || '',
        // daily_work_hours: caseData.basic_info.daily_work_hours || '8',
        // weekly_work_days: caseData.basic_info.weekly_work_days || '5'
      }
    }

    // データ取得後の詳細なログ
    console.log('Case data structure (detailed):', {
      rawData: caseData,
      basicInfoKeys: caseData?.basic_info ? Object.keys(caseData.basic_info) : [],
      basicInfoTypes: caseData?.basic_info ? Object.entries(caseData.basic_info).map(([key, value]) => ({
        field: key,
        type: typeof value,
        value: value
      })) : []
    })

    return {
      success: true,
      data: {
        case: caseData,
        hashtags: hashtags || []
      }
    }
  } catch (error) {
    console.error('Error getting user case:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ケースの取得に失敗しました'
    }
  }
})
*/ 