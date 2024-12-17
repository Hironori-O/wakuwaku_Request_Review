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
          <div style="white-space: pre-wrap;">{{ localCaseData.episode }}</div>
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

interface CaseData {
  id: string
  basic_info: BasicInfo
  disability_status: DisabilityStatus
  considerations: Considerations
  episode: string
}

interface Hashtag {
  id: string
  text: string
}

const props = defineProps<{
  caseData: CaseData
  hashtags?: Hashtag[]
}>()

// caseDataをreactiveにする
const localCaseData = reactive<CaseData>({
  id: props.caseData.id,
  basic_info: { ...props.caseData.basic_info },
  disability_status: { ...props.caseData.disability_status },
  considerations: { ...props.caseData.considerations },
  episode: props.caseData.episode
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
const getAttendanceText = (value: string) => {
  return frequencyOptions[value] || value
}

// コミュニケーションの表示テキストを生成
const getCommunicationText = (value: string) => {
  return communicationOptions[value] || value
}

const emit = defineEmits(['edit'])

// 編集ボタンのハンドラー
const handleEdit = () => {
  emit('edit')
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

// プロパティの変更を監視
watch(() => props.caseData, (newValue) => {
  Object.assign(localCaseData, newValue)
}, { deep: true })
</script> 