import OpenAI from 'openai'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const openai = new OpenAI({
    apiKey: config.openaiApiKey
  })

  try {
    const body = await readBody(event)
    console.log('Complete request body:', JSON.stringify(body, null, 2))

    // データの構造を確認
    const { case_data } = body
    console.log('Case data:', JSON.stringify(case_data, null, 2))

    if (!case_data) {
      console.error('Case data is missing')
      throw new Error('必要なデータが取得できません')
    }

    const { disability_status, considerations, basic_info } = case_data.form_data || {}
    
    // デバッグ情報の追加
    console.log('Data structure:', {
      form_data_exists: !!case_data.form_data,
      basic_info_exists: !!basic_info,
      basic_info_keys: basic_info ? Object.keys(basic_info) : null,
      disability_status_exists: !!disability_status,
      disability_status_keys: disability_status ? Object.keys(disability_status) : null,
      considerations_exists: !!considerations,
      considerations_keys: considerations ? Object.keys(considerations) : null
    })

    // データが不足している場合はエラーを返す
    if (!disability_status || !considerations || !basic_info) {
      console.error('Missing required data')
      throw new Error('必要なデータが取得できません')
    }

    // 勤怠状況のテキスト生成
    const attendanceText = Object.entries({
      lateness: '遅刻',
      early_leaving: '早退',
      sudden_absence: '急な休み',
      leaving_during_work: '仕事の途中で抜けること'
    }).filter(([key, label]) => 
      disability_status?.[key] !== 'まったくない'
    ).map(([key, label]) => 
      `${label}が${disability_status[key]}`
    ).join('、')

    // プロンプトの作成
    const prompt = `
【基本情報】
名前（本人）：${basic_info?.person_name || ''}
会社名：${basic_info?.company_name || ''}
住所：${basic_info?.address || ''}
電話番号：${basic_info?.phone || ''}
勤務形態：${basic_info?.work_type || ''}
勤務時間：${basic_info?.work_hours || ''}

【障害の様子】
・勤怠状況：${attendanceText || '特に問題なし'}
・同僚とのコミュニケーション：${disability_status.communication || ''}
・作業能力：${disability_status.work_capability?.join('、') || ''}
・業務遂行能力：${disability_status.work_performance?.join('、') || ''}

【配慮事項】
・物理的環境：${considerations.physical_environment?.join('、') || ''}
・作業上の配慮：${considerations.work_considerations?.join('、') || ''}
・コミュニケーション支援：${considerations.communication_support?.join('、') || ''}
・人的支援：${considerations.human_support?.join('、') || ''}
・健康・安全管理：${considerations.health_safety?.join('、') || ''}
・キャリア形成：${considerations.career_development?.join('、') || ''}
・メンタルヘルス：${considerations.mental_support?.join('、') || ''}

記述のポイント：
- 見出しは不要です
- 最初にフルネームを記載し、その後は「苗字＋さん」と記述してください
- 必ず以下の内容を含めて、400文字程度で記述してください：
  1. 勤務開始時期と初期の状況
  2. 具体的な課題（勤怠、作業能力、コミュニケーションなど）
  3. 課題に対する具体的な対応（面談、業務調整、支援内容）
  4. 対応後の変化や現状
  5. 今後の方針
- 時系列に沿って具体的に記述してください
- 抽象的な表現は避け、具体的な事実と対応を説明してください`

    // ChatGPT APIを呼び出し
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: '就労状況報告書の作成者として、具体的な状況と対応について記述してください。見出しは付けず、時期や期間、具体的な対応内容を含めて説明してください。抽象的な表現は避け、具体的な事実と対応を時系列で説明してください。最初にフルネームを記載し、その後は「苗字＋さん」と記述してください。400文字程度の具体的で詳細な記述を心がけてください。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'gpt-4',
      temperature: 0.2
    })

    return {
      success: true,
      data: {
        episode: completion.choices[0]?.message?.content || ''
      }
    }
  } catch (error) {
    console.error('Error generating episode:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'エピソードの生成に失敗しました'
    }
  }
}) 