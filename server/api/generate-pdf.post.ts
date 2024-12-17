import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'
import handlebars from 'handlebars'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface FormData {
  basic_info: {
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
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  try {
    const body = await readBody(event)
    const { case_id } = body

    if (!case_id) {
      throw new Error('ケースIDが指定されていません')
    }

    console.log('Fetching case data for ID:', case_id)

    // ケースデータの取得
    const { data: caseData, error: caseError } = await supabase
      .from('user_cases')
      .select('*')
      .eq('id', case_id)
      .single()

    if (caseError) {
      console.error('Error fetching case:', caseError)
      throw new Error('ケースデータの取得に失敗しました')
    }

    if (!caseData || !caseData.form_data) {
      console.error('No case data or form data:', caseData)
      throw new Error('ケースデータが不正です')
    }

    // データの前処理
    const formData = caseData.form_data as FormData
    console.log('Raw form data:', JSON.stringify(formData, null, 2))

    // テンプレートの読み込み
    const templatePath = resolve(process.cwd(), 'templates/case-report.html')
    console.log('Template path:', templatePath)
    
    let templateHtml
    try {
      templateHtml = readFileSync(templatePath, 'utf-8')
      console.log('Template loaded successfully')
    } catch (error) {
      console.error('Error reading template:', error)
      throw new Error('テンプレートファイルの読み込みに失敗しました')
    }

    const template = handlebars.compile(templateHtml)

    // テンプレートにデータを適用
    const html = template({
      date: new Date().toLocaleDateString('ja-JP'),
      basic_info: {
        person_name: formData.basic_info.person_name,
        company_name: formData.basic_info.company_name,
        address: formData.basic_info.address,
        phone: formData.basic_info.phone,
        position: formData.basic_info.position,
        writer_name: formData.basic_info.writer_name,
        relationship: formData.basic_info.relationship,
        work_type: formData.basic_info.work_type,
        work_hours: formData.basic_info.work_hours
      },
      disability_status: {
        lateness: formData.disability_status.lateness,
        early_leaving: formData.disability_status.early_leaving,
        sudden_absence: formData.disability_status.sudden_absence,
        leaving_during_work: formData.disability_status.leaving_during_work,
        communication: formData.disability_status.communication,
        work_capability: Array.isArray(formData.disability_status.work_capability)
          ? formData.disability_status.work_capability.join('、')
          : '',
        work_performance: Array.isArray(formData.disability_status.work_performance)
          ? formData.disability_status.work_performance.join('、')
          : ''
      },
      considerations: {
        physical_environment: Array.isArray(formData.considerations.physical_environment)
          ? formData.considerations.physical_environment.join('、')
          : '',
        work_considerations: Array.isArray(formData.considerations.work_considerations)
          ? formData.considerations.work_considerations.join('、')
          : '',
        communication_support: Array.isArray(formData.considerations.communication_support)
          ? formData.considerations.communication_support.join('、')
          : '',
        human_support: Array.isArray(formData.considerations.human_support)
          ? formData.considerations.human_support.join('、')
          : '',
        health_safety: Array.isArray(formData.considerations.health_safety)
          ? formData.considerations.health_safety.join('、')
          : '',
        career_development: Array.isArray(formData.considerations.career_development)
          ? formData.considerations.career_development.join('、')
          : '',
        mental_support: Array.isArray(formData.considerations.mental_support)
          ? formData.considerations.mental_support.join('、')
          : ''
      },
      episode: caseData.episode || ''
    })

    // PDFの生成
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    try {
      const page = await browser.newPage()
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      })

      // PDFの設定
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      })

      // PDFをBase64エンコード
      const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')

      return {
        success: true,
        data: {
          pdf: pdfBase64
        }
      }
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error('Error generating PDF:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PDFの生成に失敗しました'
    }
  }
}) 