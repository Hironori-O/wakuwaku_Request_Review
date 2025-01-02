// 一時的に使用しないためコメントアウト
/*
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseKey
  )

  try {
    const query = getQuery(event)
    const hashtagIds = (query.hashtags as string || '').split(',').filter(Boolean)

    if (hashtagIds.length === 0) {
      throw new Error('ハッシュタグが指定されていません')
    }

    // 指定されたハッシュタグを持つ最新のケースを取得
    const { data: caseData, error: caseError } = await supabase
      .from('user_cases')
      .select('*, case_hashtags!inner(hashtag_id)')
      .in('case_hashtags.hashtag_id', hashtagIds)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (caseError) {
      console.error('Error fetching case:', caseError)
      throw new Error('ケースの取得に失敗しました')
    }

    if (!caseData) {
      throw new Error('ケースが見つかりません')
    }

    // ハッシュタグの取得
    const { data: hashtags, error: hashtagsError } = await supabase
      .from('hashtags')
      .select('*')
      .in('id', hashtagIds)

    if (hashtagsError) {
      console.error('Error fetching hashtags:', hashtagsError)
      throw new Error('ハッシュタグの取得に失敗しました')
    }

    // データ取得結果を確認
    console.log('Latest case data:', {
      basic_info: caseData?.basic_info,
      basic_info_raw: JSON.stringify(caseData?.basic_info, null, 2),
      basic_info_keys: caseData?.basic_info ? Object.keys(caseData.basic_info) : [],
      basic_info_values: caseData?.basic_info ? Object.entries(caseData.basic_info).map(([key, value]) => ({
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
    console.error('Error getting latest case:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ケースの取得に失敗しました'
    }
  }
})
*/ 