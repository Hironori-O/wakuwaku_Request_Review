<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>登録内容</span>
      <v-btn
        color="primary"
        @click="handleGeneratePdf"
        :loading="generating"
      >
        PDF出力
      </v-btn>
    </v-card-title>
    <v-card-text>
      <!-- 基本情報 -->
      <div class="mb-4">
        <h3 class="text-h6 mb-2">基本情報</h3>
        <v-list>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>名前（本人）</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.basic_info?.person_name }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-office-building</v-icon>
            </template>
            <v-list-item-title>会社名</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.basic_info?.company_name }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-map-marker</v-icon>
            </template>
            <v-list-item-title>住所</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.basic_info?.address }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-phone</v-icon>
            </template>
            <v-list-item-title>電話番号</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.basic_info?.phone }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-account-tie</v-icon>
            </template>
            <v-list-item-title>記入者の役職</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.basic_info?.position }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-account-edit</v-icon>
            </template>
            <v-list-item-title>記入者の氏名</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.basic_info?.writer_name }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-account-group</v-icon>
            </template>
            <v-list-item-title>本人との関係</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.basic_info?.relationship }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-briefcase</v-icon>
            </template>
            <v-list-item-title>勤務形態</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.basic_info?.work_type }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-clock</v-icon>
            </template>
            <v-list-item-title>勤務時間</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.basic_info?.work_hours }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="'hire_date' in localCaseData.basic_info">
            <template v-slot:prepend>
              <v-icon>mdi-calendar</v-icon>
            </template>
            <v-list-item-title>入社日</v-list-item-title>
            <v-list-item-subtitle>
              {{ localCaseData.basic_info.hire_date || '未設定' }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="'department' in localCaseData.basic_info">
            <template v-slot:prepend>
              <v-icon>mdi-office-building</v-icon>
            </template>
            <v-list-item-title>所属部署</v-list-item-title>
            <v-list-item-subtitle>
              {{ localCaseData.basic_info.department || '未設定' }}
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="'daily_work_hours' in localCaseData.basic_info">
            <template v-slot:prepend>
              <v-icon>mdi-clock</v-icon>
            </template>
            <v-list-item-title>1日の勤務時間</v-list-item-title>
            <v-list-item-subtitle>
              {{ localCaseData.basic_info.daily_work_hours }}時間
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="'weekly_work_days' in localCaseData.basic_info">
            <template v-slot:prepend>
              <v-icon>mdi-calendar-week</v-icon>
            </template>
            <v-list-item-title>週の勤務日数</v-list-item-title>
            <v-list-item-subtitle>
              {{ localCaseData.basic_info.weekly_work_days }}日
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>

      <!-- 障害の様子 -->
      <div class="mb-4">
        <h3 class="text-h6 mb-2">障害の様子</h3>
        <v-list>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-clock-alert</v-icon>
            </template>
            <v-list-item-title>勤怠状況</v-list-item-title>
            <v-list-item-subtitle>
              <div v-if="hasAttendanceIssues">
                <div v-if="localCaseData.disability_status?.lateness !== 'まったくない'">
                  遅刻: {{ getAttendanceText(localCaseData.disability_status?.lateness) }}
                </div>
                <div v-if="localCaseData.disability_status?.early_leaving !== 'まったくない'">
                  早退: {{ getAttendanceText(localCaseData.disability_status?.early_leaving) }}
                </div>
                <div v-if="localCaseData.disability_status?.sudden_absence !== 'まったくない'">
                  急な休み: {{ getAttendanceText(localCaseData.disability_status?.sudden_absence) }}
                </div>
                <div v-if="localCaseData.disability_status?.leaving_during_work !== 'まったくない'">
                  仕事の途中で抜けること: {{ getAttendanceText(localCaseData.disability_status?.leaving_during_work) }}
                </div>
              </div>
              <div v-else>特に問題なし</div>
            </v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-account-group</v-icon>
            </template>
            <v-list-item-title>同僚とのコミュニケーション</v-list-item-title>
            <v-list-item-subtitle>{{ getCommunicationText(localCaseData.disability_status?.communication) }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="localCaseData.disability_status?.work_capability?.length">
            <template v-slot:prepend>
              <v-icon>mdi-hammer-wrench</v-icon>
            </template>
            <v-list-item-title>作業能力</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.disability_status?.work_capability.join('、') }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="localCaseData.disability_status?.work_performance?.length">
            <template v-slot:prepend>
              <v-icon>mdi-chart-line</v-icon>
            </template>
            <v-list-item-title>業務遂行能力</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.disability_status?.work_performance.join('、') }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>

      <!-- 配慮事項 -->
      <div class="mb-4">
        <h3 class="text-h6 mb-2">配慮事項</h3>
        <v-list>
          <v-list-item v-if="localCaseData.considerations?.physical_environment?.length">
            <template v-slot:prepend>
              <v-icon>mdi-office-building-cog</v-icon>
            </template>
            <v-list-item-title>物理的環境</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.considerations?.physical_environment.join('、') }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="localCaseData.considerations?.work_considerations?.length">
            <template v-slot:prepend>
              <v-icon>mdi-cog</v-icon>
            </template>
            <v-list-item-title>作業上の配慮</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.considerations?.work_considerations.join('、') }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="localCaseData.considerations?.communication_support?.length">
            <template v-slot:prepend>
              <v-icon>mdi-message-processing</v-icon>
            </template>
            <v-list-item-title>コミュニケーション支援</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.considerations?.communication_support.join('、') }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="localCaseData.considerations?.human_support?.length">
            <template v-slot:prepend>
              <v-icon>mdi-account-multiple</v-icon>
            </template>
            <v-list-item-title>人的支援</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.considerations?.human_support.join('、') }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="localCaseData.considerations?.health_safety?.length">
            <template v-slot:prepend>
              <v-icon>mdi-heart-pulse</v-icon>
            </template>
            <v-list-item-title>健康・安全管理</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.considerations?.health_safety.join('、') }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="localCaseData.considerations?.career_development?.length">
            <template v-slot:prepend>
              <v-icon>mdi-ladder</v-icon>
            </template>
            <v-list-item-title>キャリア形成</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.considerations?.career_development.join('、') }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="localCaseData.considerations?.mental_support?.length">
            <template v-slot:prepend>
              <v-icon>mdi-brain</v-icon>
            </template>
            <v-list-item-title>メンタルヘルス</v-list-item-title>
            <v-list-item-subtitle>{{ localCaseData.considerations?.mental_support.join('、') }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>

      <!-- エピソード -->
      <div class="mb-4">
        <h3 class="text-h6 mb-2">エピソード</h3>
        <v-card variant="outlined" class="pa-4">
          <div v-if="localCaseData.episode" style="white-space: pre-wrap;">
            {{ localCaseData.episode }}
          </div>
          <div v-else class="text-grey">
            エピソードはまだ生成されていません
          </div>
        </v-card>
      </div>

      <!-- ハッシュタグ -->
      <div v-if="hashtags?.length">
        <h3 class="text-h6 mb-2">ハッシュタグ</h3>
        <div class="d-flex flex-wrap">
          <v-chip
            v-for="hashtag in hashtags"
            :key="hashtag.id"
            class="ma-1"
            color="primary"
          >
            {{ hashtag.text }}
          </v-chip>
        </div>
      </div>

      <!-- 編集ボタン -->
      <div class="d-flex justify-end mt-4">
        <v-btn
          color="primary"
          @click="handleEdit"
        >
          編集する
        </v-btn>
      </div>
    </v-card-text>

    <!-- 成功メッセージ -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
    >
      {{ successMessage }}
    </v-snackbar>

    <!-- エラーメッセージ -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="3000"
    >
      {{ errorMessage }}
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import type { CaseData, Hashtag } from '~/types/case'

// Propsの定義
interface Props {
  caseData: CaseData;
  hashtags: Hashtag[];
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'edit'): void
}>()

// caseDataをreactiveにする
const localCaseData = reactive<CaseData>({
  id: props.caseData.id,
  basic_info: {
    ...props.caseData.basic_info,
    hire_date: 'hire_date' in (props.caseData.basic_info || {}) ? props.caseData.basic_info.hire_date : '',
    department: 'department' in (props.caseData.basic_info || {}) ? props.caseData.basic_info.department : '',
    daily_work_hours: 'daily_work_hours' in (props.caseData.basic_info || {}) ? props.caseData.basic_info.daily_work_hours : '',
    weekly_work_days: 'weekly_work_days' in (props.caseData.basic_info || {}) ? props.caseData.basic_info.weekly_work_days : ''
  },
  disability_status: { ...props.caseData.disability_status },
  considerations: {
    physical_environment: [...(props.caseData.considerations?.physical_environment || [])],
    work_considerations: [...(props.caseData.considerations?.work_considerations || [])],
    communication_support: [...(props.caseData.considerations?.communication_support || [])],
    human_support: [...(props.caseData.considerations?.human_support || [])],
    health_safety: [...(props.caseData.considerations?.health_safety || [])],
    career_development: [...(props.caseData.considerations?.career_development || [])],
    mental_support: [...(props.caseData.considerations?.mental_support || [])]
  },
  episode: props.caseData.episode || ''
})

// デバッグ用のログ出力を追加
console.log('CaseViewer received data:', {
  basic_info: props.caseData.basic_info,
  localData: localCaseData.basic_info
})

// 勤怠状況の表示用オプション
const frequencyOptions = {
  'まったくない': '問題なし',
  'たまにある': '時々発生',
  'よくある': '頻繁に発生'
}

// コミュニケーションの表示用オプション
const communicationOptions = {
  '全く問題なし': '問題なし',
  'たまにフォローが必要（報連相などができない場面がある）': '時々フォローが必要',
  'フォローが必要（報告・連絡・相談・質問、雑談、双方向の意思疎通などができない）': '常にフォローが必要'
}

// 勤怠状況に問題があるかどうかを判定
const hasAttendanceIssues = computed(() => {
  const status = localCaseData.disability_status
  return status &&
    (status.lateness !== 'まったくない' ||
     status.early_leaving !== 'まったくない' ||
     status.sudden_absence !== 'まったくない' ||
     status.leaving_during_work !== 'まったくない')
})

// 勤怠状況の表示テキストを生成
const getAttendanceText = (value: string): string => {
  return frequencyOptions[value as keyof typeof frequencyOptions] || value
}

// コミュニケーションの表示テキストを生成
const getCommunicationText = (value: string): string => {
  return communicationOptions[value as keyof typeof communicationOptions] || value
}

const generating = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// PDFの生成と保存
const handleGeneratePdf = async () => {
  generating.value = true
  try {
    if (!localCaseData.id) {
      throw new Error('ケースIDが見つかりません')
    }

    const response = await $fetch<{
      success: boolean
      data?: { pdf: string }
      error?: string
    }>('/api/generate-pdf', {
      method: 'POST',
      body: {
        case_id: localCaseData.id
      }
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || 'PDFの生成に失敗しました')
    }

    // Base64のPDFデータをバイナリに変換
    const binaryPdf = atob(response.data.pdf)
    const bytes = new Uint8Array(binaryPdf.length)
    for (let i = 0; i < binaryPdf.length; i++) {
      bytes[i] = binaryPdf.charCodeAt(i)
    }

    // Blobの作成とダウンロード
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `就労状況報告書_${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    successMessage.value = 'PDFを出力しました'
    showSuccess.value = true
  } catch (error) {
    console.error('Error generating PDF:', error)
    errorMessage.value = error instanceof Error ? error.message : 'PDFの出力に失敗しました'
    showError.value = true
  } finally {
    generating.value = false
  }
}

// 編集ボタンのハンドラー
const handleEdit = () => {
  emit('edit')
}

// デバッグログを強化
onMounted(() => {
  console.log('CaseViewer mounted - Full Data:', {
    originalData: props.caseData,
    basicInfo: {
      ...props.caseData.basic_info,
      hire_date_type: typeof props.caseData.basic_info?.hire_date,
      department_type: typeof props.caseData.basic_info?.department,
      daily_hours_type: typeof props.caseData.basic_info?.daily_work_hours,
      weekly_days_type: typeof props.caseData.basic_info?.weekly_work_days,
    },
    localData: {
      ...localCaseData.basic_info,
      hire_date_type: typeof localCaseData.basic_info?.hire_date,
      department_type: typeof localCaseData.basic_info?.department,
      daily_hours_type: typeof localCaseData.basic_info?.daily_work_hours,
      weekly_days_type: typeof localCaseData.basic_info?.weekly_work_days,
    }
  })
})

// Props受け取り時のデバッグログを追加
onMounted(() => {
  console.log('CaseViewer Props:', {
    original: props.caseData,
    basic_info: props.caseData?.basic_info,
    basic_info_keys: Object.keys(props.caseData?.basic_info || {}),
    basic_info_values: props.caseData?.basic_info
  })
})

// データ更新時の監視
watch(() => props.caseData, (newValue) => {
  console.log('CaseData updated:', {
    newValue,
    basicInfo: newValue.basic_info
  })

  // 全てのデータを更新
  localCaseData.id = newValue.id
  localCaseData.basic_info = {
    person_name: newValue.basic_info?.person_name || '',
    company_name: newValue.basic_info?.company_name || '',
    address: newValue.basic_info?.address || '',
    phone: newValue.basic_info?.phone || '',
    position: newValue.basic_info?.position || '',
    writer_name: newValue.basic_info?.writer_name || '',
    relationship: newValue.basic_info?.relationship || '',
    work_type: newValue.basic_info?.work_type || '',
    work_hours: newValue.basic_info?.work_hours || '',
    hire_date: newValue.basic_info?.hire_date || '',
    department: newValue.basic_info?.department || '',
    daily_work_hours: newValue.basic_info?.daily_work_hours || '',
    weekly_work_days: newValue.basic_info?.weekly_work_days || ''
  }
  localCaseData.disability_status = { ...newValue.disability_status }
  localCaseData.considerations = {
    physical_environment: [...(newValue.considerations?.physical_environment || [])],
    work_considerations: [...(newValue.considerations?.work_considerations || [])],
    communication_support: [...(newValue.considerations?.communication_support || [])],
    human_support: [...(newValue.considerations?.human_support || [])],
    health_safety: [...(newValue.considerations?.health_safety || [])],
    career_development: [...(newValue.considerations?.career_development || [])],
    mental_support: [...(newValue.considerations?.mental_support || [])]
  }
  localCaseData.episode = newValue.episode || ''
}, { deep: true })
</script>