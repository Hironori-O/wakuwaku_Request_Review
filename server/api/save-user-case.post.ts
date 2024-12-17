import { createClient } from '@supabase/supabase-js'

interface BasicInfo {
  person_name: string
  company_name: string
  address: string
  phone: string
  position: string
  writer_name: string
  relationship: string
  work_type: string
  work_hours: string
}

interface DisabilityStatus {
  lateness: string
  early_leaving: string
  sudden_absence: string
  leaving_during_work: string
  communication: string
  work_capability: string[]
  work_performance: string[]
}

interface Considerations {
  physical_environment: string[]
  work_considerations: string[]
  communication_support: string[]
  human_support: string[]
  health_safety: string[]
  career_development: string[]
  mental_support: string[]
}

interface SaveCaseRequest {
  basic_info: BasicInfo
  disability_status: DisabilityStatus
  considerations: Considerations
  episode: string
  link_id: string
  status: 'draft' | 'completed'
}

// 値が空でないかチェックする関数
function isNotEmpty(value: any): boolean {
  if (Array.isArray(value)) {
    return value.length > 0
  }
  return value !== '' && value !== null && value !== undefined
}

// バリデーション関数
function validateBasicInfo(basicInfo: BasicInfo, isDraft: boolean): boolean {
  if (isDraft) {
    // 一時保存の場合は、少なくとも1つのフィールドが入力されていればOK
    return Object.values(basicInfo).some(value => isNotEmpty(value))
  }
  
  // 完了保存の場合は全フィールドが必須
  return Object.values(basicInfo).every(value => isNotEmpty(value))
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  try {
    const body = await readBody(event) as SaveCaseRequest
    const { basic_info, disability_status, considerations, episode, link_id, status } = body
    const isDraft = status === 'draft'

    // 完了保存時のみcompany_nameは必須
    if (!isDraft && !basic_info.company_name) {
      return {
        success: false,
        error: '会社名は必須です'
      }
    }

    console.log('Received request:', {
      link_id,
      status,
      basic_info,
      hasDisabilityStatus: !!disability_status,
      hasConsiderations: !!considerations,
      hasEpisode: !!episode
    })

    if (!link_id) {
      return {
        success: false,
        error: 'リンクIDが指定されていません'
      }
    }

    // 一時保存時は入力チェックを緩和
    if (!isDraft && !validateBasicInfo(basic_info, isDraft)) {
      return {
        success: false,
        error: '必須項目を入力してください'
      }
    }

    // 既存のケース情報を確認
    const { data: existingCase, error: selectError } = await supabase
      .from('user_cases')
      .select('id')
      .eq('link_id', link_id)
      .maybeSingle()

    if (selectError) {
      console.error('Error checking existing case:', selectError)
      return {
        success: false,
        error: `既存のケース情報の確認に失敗しました: ${selectError.message}`
      }
    }

    let caseError
    if (existingCase) {
      // 既存のケースを更新
      const { error } = await supabase
        .from('user_cases')
        .update({
          company_name: basic_info.company_name || '',  // 一時保存時は空文字を許容
          basic_info: {
            person_name: basic_info.person_name,
            company_name: basic_info.company_name,
            address: basic_info.address,
            phone: basic_info.phone,
            position: basic_info.position,
            writer_name: basic_info.writer_name,
            relationship: basic_info.relationship,
            work_type: basic_info.work_type,
            work_hours: basic_info.work_hours
          },
          disability_status,
          considerations,
          episode: episode || '',
          status: status || 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCase.id)
      caseError = error
    } else {
      // 新規ケースを作成
      const { error } = await supabase
        .from('user_cases')
        .insert({
          link_id,
          company_name: basic_info.company_name || '',  // 一時保存時は空文字を許容
          basic_info: {
            person_name: basic_info.person_name,
            company_name: basic_info.company_name,
            address: basic_info.address,
            phone: basic_info.phone,
            position: basic_info.position,
            writer_name: basic_info.writer_name,
            relationship: basic_info.relationship,
            work_type: basic_info.work_type,
            work_hours: basic_info.work_hours
          },
          disability_status,
          considerations,
          episode: episode || '',
          status: status || 'draft'
        })
      caseError = error
    }

    if (caseError) {
      console.error('Error saving case:', {
        message: caseError.message,
        details: caseError.details,
        hint: caseError.hint,
        code: caseError.code
      })
      return {
        success: false,
        error: `ケース情報の保存に失敗しました: ${caseError.message}`
      }
    }

    // user_linksテーブルの状態を更新
    const { error: linkError } = await supabase
      .from('user_links')
      .update({
        used: status === 'completed',
        status: status || 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', link_id)

    if (linkError) {
      console.error('Error updating link status:', linkError)
    }

    return {
      success: true,
      data: {
        status: status || 'draft'
      }
    }
  } catch (error) {
    console.error('Error saving user case:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ケースの保存に失敗しました'
    }
  }
})
