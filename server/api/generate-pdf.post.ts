import { createClient } from '@supabase/supabase-js'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { readFileSync, writeFileSync } from 'fs'
import { promises as fs } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface FormData {
  basic_info: {
    person_name: string      // 対象者名
    company_name: string     // 会社名
    department: string       // 部署名
    address: string         // 住所
    phone: string          // 電話番号
    position: string       // 役職
    writer_name: string    // 記入者名
    relationship: string   // 関係性
    work_type: string     // 勤務形態
    work_hours: string    // 勤務時間
    hire_date: string     // 入社日
    daily_work_hours: string // 1日の勤務時間
    weekly_work_days: string // 週の勤務日数
  }
  disability_status: {
    lateness: string
    early_leaving: string
    sudden_absence: string
    leaving_during_work: string
    communication: string
    work_capability: string[]
    work_performance: string[]
  }
  considerations: {
    physical_environment: string[]
    work_considerations: string[]
    communication_support: string[]
    human_support: string[]
    health_safety: string[]
    career_development: string[]
    mental_support: string[]
  }
  episode: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  try {
    const body = await readBody(event)
    const { case_id, form_data } = body

    console.log('Debug - Request body:', {
      case_id,
      form_data,
      raw_body: JSON.stringify(body, null, 2)
    })

    if (!case_id) {
      throw new Error('ケースIDが指定されていません')
    }

    // form_dataが直接提供されている場合はそれを使用
    if (form_data) {
      console.log('Using provided form data')
      return await generatePdfFromData(form_data)
    }

    console.log('Fetching case data for ID:', case_id)

    // ケースデータの取得
    const { data: caseData, error: caseError } = await supabase
      .from('user_cases')
      .select('*')
      .eq('link_id', case_id)
      .single()

    console.log('Debug - Case Data:', {
      case_id,
      caseData,
      error: caseError,
      hasFormData: caseData?.form_data ? 'Yes' : 'No',
      formDataType: caseData?.form_data ? typeof caseData.form_data : 'N/A',
      rawCaseData: JSON.stringify(caseData, null, 2)
    })

    if (caseError) {
      console.error('Error fetching case:', caseError)
      throw new Error('ケースデータの取得に失敗しました')
    }

    if (!caseData) {
      console.error('No case data found')
      throw new Error('ケースデータが見つかりません')
    }

    // form_dataの構造を確認
    const formData = {
      basic_info: caseData.basic_info || {},
      disability_status: caseData.disability_status || {},
      considerations: caseData.considerations || {},
      episode: caseData.episode || ''
    }

    console.log('Processed form data:', JSON.stringify(formData, null, 2))

    return await generatePdfFromData(formData)
  } catch (error) {
    console.error('Error generating PDF:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PDFの生成に失敗しました'
    }
  }
})

// PDFを生成する関数
async function generatePdfFromData(formData: FormData) {
  // テンプレートの読み込みと処理
  const templatePath = resolve(process.cwd(), 'template.docx')
  console.log('Template path:', templatePath)
  
  let content
  try {
    content = readFileSync(templatePath, 'binary')
    console.log('Template loaded successfully')
  } catch (error) {
    console.error('Error reading template:', error)
    throw new Error('テンプレートファイルの読み込みに失敗しました')
  }

  // Docxテンプレートの準備
  const zip = new PizZip(content)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  // テンプレートにデータを適用
  const templateData = {
    // 会社情報
    company_name: formData.basic_info.company_name,
    department: formData.basic_info.department,
    position: formData.basic_info.position,
    
    // 申請人情報
    applicant_name: formData.basic_info.person_name,
    
    // 入社日（hire_dateから分割）
    ...parseHireDate(formData.basic_info.hire_date),
    
    // 勤務情報
    work_hours: formData.basic_info.daily_work_hours,
    work_days: formData.basic_info.weekly_work_days,
    
    // 仕事内容の変更履歴
    initial_work: formData.disability_status.work_capability?.[0] || '',
    change_date: formData.disability_status.leaving_during_work || '',
    
    // 職場での状況
    current_status: formData.disability_status.communication,
    support_status: [
      ...formData.disability_status.work_capability || [],
      ...formData.disability_status.work_performance || []
    ].join('、'),
    episodes: formData.episode || '',
    
    // 署名情報（現在の日付を使用）
    ...getCurrentDate(),
    sign_company: formData.basic_info.company_name,
    sign_address: formData.basic_info.address,
    sign_name: formData.basic_info.writer_name
  }

  console.log('Template data:', JSON.stringify(templateData, null, 2))

  // テンプレートにデータを適用
  doc.render(templateData)

  // 生成されたdocxを保存
  const tempDocxPath = resolve(process.cwd(), `temp_${Date.now()}.docx`)
  const tempPdfPath = resolve(process.cwd(), `temp_${Date.now()}.pdf`)
  const buf = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE'
  })

  // 一時ファイルとして保存
  writeFileSync(tempDocxPath, buf)

  try {
    // docxをPDFに変換
    console.log('Converting DOCX to PDF:', {
      docxPath: tempDocxPath,
      pdfPath: tempPdfPath,
      outDir: dirname(tempPdfPath)
    })

    const libreOfficePath = '/Applications/LibreOffice.app/Contents/MacOS/soffice'
    const { stdout, stderr } = await execAsync(`"${libreOfficePath}" --headless --convert-to pdf ${tempDocxPath} --outdir ${dirname(tempPdfPath)}`)
    console.log('LibreOffice conversion output:', { stdout, stderr })
    
    // PDFファイルが生成されたか確認
    try {
      const stats = await fs.stat(tempPdfPath)
      console.log('Generated PDF file stats:', stats)
    } catch (statError) {
      console.error('PDF file not found:', statError)
      throw new Error('PDF変換後のファイルが見つかりません')
    }
    
    // PDFファイルを読み込んでBase64エンコード
    const pdfBuffer = readFileSync(tempPdfPath)
    console.log('PDF file size:', pdfBuffer.length)
    const pdfBase64 = pdfBuffer.toString('base64')

    // 一時ファイルの削除
    await execAsync(`rm ${tempDocxPath} ${tempPdfPath}`)
    console.log('Temporary files cleaned up')

    return {
      success: true,
      data: {
        pdf: pdfBase64
      }
    }
  } catch (error) {
    console.error('Error converting to PDF:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    throw new Error(`PDFへの変換に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
  }
}

// 日付パース用のヘルパー関数
function parseHireDate(hireDateStr: string) {
  try {
    const date = new Date(hireDateStr)
    return {
      join_year: date.getFullYear().toString(),
      join_month: (date.getMonth() + 1).toString(),
      join_day: date.getDate().toString()
    }
  } catch (e) {
    console.error('Error parsing hire date:', e)
    return {
      join_year: '',
      join_month: '',
      join_day: ''
    }
  }
}

// 現在の日付を取得するヘルパー関数
function getCurrentDate() {
  const now = new Date()
  return {
    sign_year: now.getFullYear().toString(),
    sign_month: (now.getMonth() + 1).toString(),
    sign_day: now.getDate().toString()
  }
} 