import { useSupabaseService } from '~/composables/useSupabase'

export default defineEventHandler(async (event) => {
  // サーバーサイドのSupabaseクライアントを取得
  const supabase = useSupabaseService()

  try {
    const query = getQuery(event)
    const caseId = query.id as string

    if (!caseId) {
      throw new Error('ケースIDが指定されていません')
    }

    // ケース情報の取得
    const { data: caseData, error: caseError } = await supabase
      .from('user_cases')
      .select('*')
      .eq('id', caseId)
      .single()

    if (caseError) {
      console.error('Error fetching case:', caseError)
      throw new Error('ケースの取得に失敗しました')
    }

    if (!caseData) {
      throw new Error('ケースが見つかりません')
    }

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