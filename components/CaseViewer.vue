  <v-btn
    color="primary"
    @click="showPreview = true"
    :loading="generating"
  >
    PDF出力
  </v-btn>

  <!-- PDFプレビューダイアログ -->
  <v-dialog
    v-model="showPreview"
    max-width="1000"
  >
    <PdfPreview
      :initial-data="getPdfData()"
      :case-id="localCaseData.link_id || ''"
      @close="showPreview = false"
    />
  </v-dialog>

// PDF出力用のデータを準備
const getPdfData = () => {
  // より詳細なデバッグ情報
  console.log('CaseViewer - Raw Data:', {
    localCaseData,
    route: route.params
  })

  // データの取得方法を修正
  const formData = localCaseData.form_data || {
    basic_info: localCaseData.basic_info || {},
    disability_status: localCaseData.disability_status || {},
    considerations: localCaseData.considerations || {},
    episode: localCaseData.episode || ''
  }

  console.log('CaseViewer - Processed Data:', {
    formData,
    basic_info: formData.basic_info,
    disability_status: formData.disability_status
  })

  const pdfData = {
    company_name: formData.basic_info?.company_name || '',
    department: formData.basic_info?.department || '',
    position: formData.basic_info?.position || '',
    applicant_name: formData.basic_info?.person_name || '',
    join_year: parseDate(formData.basic_info?.hire_date).year,
    join_month: parseDate(formData.basic_info?.hire_date).month,
    join_day: parseDate(formData.basic_info?.hire_date).day,
    work_hours: formData.basic_info?.daily_work_hours || '',
    work_days: formData.basic_info?.weekly_work_days || '',
    initial_work: formData.disability_status?.work_capability?.[0] || '',
    change_date: formData.disability_status?.leaving_during_work || '',
    current_status: formData.disability_status?.communication || '',
    support_status: [
      ...(formData.disability_status?.work_capability || []),
      ...(formData.disability_status?.work_performance || [])
    ].join('、'),
    episodes: formData.episode || '',
    ...getCurrentDate(),
    sign_company: formData.basic_info?.company_name || '',
    sign_address: formData.basic_info?.address || '',
    sign_name: formData.basic_info?.writer_name || ''
  }

  console.log('CaseViewer - PDF Data:', pdfData)

  return pdfData
}

// 日付パース用のヘルパー関数
function parseDate(dateStr: string | undefined) {
  try {
    const date = dateStr ? new Date(dateStr) : new Date()
    return {
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString(),
      day: date.getDate().toString()
    }
  } catch (e) {
    console.error('Error parsing date:', e)
    return {
      year: '',
      month: '',
      day: ''
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