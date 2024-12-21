import { useSupabaseService } from '~/composables/useSupabase'

export default defineEventHandler(async (event) => {
  const supabase = useSupabaseService()

  try {
    const { data, error } = await supabase
      .from('user_cases')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error fetching case:', error)
      throw new Error('データの取得に失敗しました')
    }

    return {
      success: true,
      data: {
        structure: data && data[0] ? Object.keys(data[0]) : [],
        sample: data && data[0] ? data[0] : null
      }
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'エラーが発生しました'
    }
  }
}) 