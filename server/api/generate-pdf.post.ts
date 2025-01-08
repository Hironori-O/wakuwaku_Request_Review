import { createClient } from '@supabase/supabase-js'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { readFileSync, writeFileSync } from 'fs'
import { promises as fs } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import puppeteer from 'puppeteer'
import Handlebars from 'handlebars'

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

    if (!case_id) {
      throw new Error('ケースIDが指定されていません')
    }

    // form_dataが直接提供されている場合はそれを使用
    let formDataToUse = form_data
    if (!form_data) {
      console.log('Fetching case data for ID:', case_id)

      // ケースデータの取得
      const { data: caseData, error: caseError } = await supabase
        .from('user_cases')
        .select('*')
        .eq('link_id', case_id)
        .single()

      if (caseError) {
        throw new Error('ケースデータの取得に失敗しました')
      }

      if (!caseData) {
        throw new Error('ケースデータが見つかりません')
      }

      formDataToUse = {
        basic_info: caseData.basic_info || {},
        disability_status: caseData.disability_status || {},
        considerations: caseData.considerations || {},
        episode: caseData.episode || ''
      }
    }

    // PDFを生成
    const pdf = await generatePdfFromData(formDataToUse)

    // PDFバイナリを直接返す
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="就労状況申立書_${new Date().toISOString().split('T')[0]}.pdf"`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'PDFの生成に失敗しました'
    })
  }
})

// PDFを生成する関数
async function generatePdfFromData(formData: FormData): Promise<Uint8Array> {
  try {
    // HTMLテンプレートの読み込み
    const templatePath = resolve(process.cwd(), 'public/templates/case-report.html')
    const templateHtml = readFileSync(templatePath, 'utf-8')
    
    // Handlebarsテンプレートの準備
    const template = Handlebars.compile(templateHtml)
    
    // テンプレートデータの準備
    const templateData = {
      // 会社情報
      company_name: formData.basic_info.company_name,
      department: formData.basic_info.department,
      position: formData.basic_info.position,
      
      // 申請人情報
      applicant_name: formData.basic_info.person_name,
      
      // 入社日
      ...parseHireDate(formData.basic_info.hire_date),
      
      // 勤務情報
      work_hours: formData.basic_info.daily_work_hours,
      work_days: formData.basic_info.weekly_work_days,
      
      // 職場での状況
      current_status: formData.disability_status.communication,
      support_status: [
        ...formData.disability_status.work_capability || [],
        ...formData.disability_status.work_performance || []
      ].join('、'),
      episodes: formData.episode || '',
      
      // 署名情報
      ...getCurrentDate(),
      sign_company: formData.basic_info.company_name,
      sign_address: formData.basic_info.address,
      sign_name: formData.basic_info.writer_name
    }

    // HTMLの生成
    const html = template(templateData)
    
    // 一時HTMLファイルとして保存
    const tempHtmlPath = resolve(process.cwd(), `temp_${Date.now()}.html`)
    writeFileSync(tempHtmlPath, html)
    
    // Puppeteerの起動
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    })
    
    try {
      const page = await browser.newPage()
      
      // HTMLファイルを読み込み
      await page.goto(`file://${tempHtmlPath}`, {
        waitUntil: 'networkidle0'
      })
      
      // PDFとして保存
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      })
      
      // 一時ファイルの削除
      await fs.unlink(tempHtmlPath)
      
      return pdf
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error(`PDFの生成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
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