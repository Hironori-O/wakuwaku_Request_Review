<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between">
      プレビュー
      <div>
        <v-btn
          color="error"
          variant="text"
          class="mr-2"
          @click="handleCancel"
          :disabled="generating"
        >
          キャンセル
        </v-btn>
        <v-btn
          color="primary"
          @click="handleSave"
          :loading="generating"
          :disabled="!isValid"
        >
          PDF出力
        </v-btn>
      </div>
    </v-card-title>
    
    <v-card-text>
      <v-form ref="form" v-model="isValid">
        <v-tabs v-model="activeTab">
          <v-tab value="basic">基本情報</v-tab>
          <v-tab value="work">勤務情報</v-tab>
          <v-tab value="episode">エピソード</v-tab>
          <v-tab value="signature">署名</v-tab>
        </v-tabs>

        <v-window v-model="activeTab" class="mt-4">
          <!-- 基本情報タブ -->
          <v-window-item value="basic">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="previewData.company_name"
                  label="会社名"
                  :rules="[v => !!v || '会社名は必須です']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="previewData.department"
                  label="部署名"
                  :rules="[v => !!v || '部署名は必須です']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="previewData.position"
                  label="役職"
                  :rules="[v => !!v || '役職は必須です']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="previewData.applicant_name"
                  label="申請者名"
                  :rules="[v => !!v || '申請者名は必須です']"
                />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- 勤務情報タブ -->
          <v-window-item value="work">
            <v-row>
              <v-col cols="12">
                <div class="d-flex align-center mb-4">
                  <span class="mr-2">入社日：</span>
                  <v-text-field
                    v-model="previewData.join_year"
                    label="年"
                    class="mr-2"
                    style="width: 100px"
                    :rules="[v => !!v || '年は必須です']"
                  />
                  <span class="mr-2">年</span>
                  <v-text-field
                    v-model="previewData.join_month"
                    label="月"
                    class="mr-2"
                    style="width: 80px"
                    :rules="[v => !!v || '月は必須です']"
                  />
                  <span class="mr-2">月</span>
                  <v-text-field
                    v-model="previewData.join_day"
                    label="日"
                    style="width: 80px"
                    :rules="[v => !!v || '日は必須です']"
                  />
                  <span>日</span>
                </div>
              </v-col>
              <v-col cols="12">
                <div class="d-flex align-center mb-4">
                  <span class="mr-2">勤務時間：</span>
                  <v-text-field
                    v-model="previewData.work_hours"
                    label="時間"
                    class="mr-2"
                    style="width: 80px"
                    :rules="[v => !!v || '時間は必須です']"
                  />
                  <span class="mr-4">時間/日</span>
                  <v-text-field
                    v-model="previewData.work_days"
                    label="日数"
                    class="mr-2"
                    style="width: 80px"
                    :rules="[v => !!v || '日数は必須です']"
                  />
                  <span>日/週</span>
                </div>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="workContent"
                  label="業務内容"
                  auto-grow
                  rows="3"
                  :rules="[v => !!v || '業務内容は必須です']"
                />
              </v-col>
            </v-row>
          </v-window-item>

          <!-- エピソードタブ -->
          <v-window-item value="episode">
            <v-textarea
              v-model="previewData.episodes"
              label="エピソード"
              auto-grow
              rows="10"
              :rules="[v => !!v || 'エピソードは必須です']"
            />
          </v-window-item>

          <!-- 署名タブ -->
          <v-window-item value="signature">
            <v-row>
              <v-col cols="12">
                <div class="d-flex align-center mb-4">
                  <span class="mr-2">署名日：</span>
                  <v-text-field
                    v-model="previewData.sign_year"
                    label="年"
                    class="mr-2"
                    style="width: 100px"
                    :rules="[v => !!v || '年は必須です']"
                  />
                  <span class="mr-2">年</span>
                  <v-text-field
                    v-model="previewData.sign_month"
                    label="月"
                    class="mr-2"
                    style="width: 80px"
                    :rules="[v => !!v || '月は必須です']"
                  />
                  <span class="mr-2">月</span>
                  <v-text-field
                    v-model="previewData.sign_day"
                    label="日"
                    style="width: 80px"
                    :rules="[v => !!v || '日は必須です']"
                  />
                  <span>日</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="previewData.sign_company"
                  label="事業所名"
                  :rules="[v => !!v || '事業所名は必須です']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="previewData.sign_address"
                  label="事業所所在地"
                  :rules="[v => !!v || '事業所所在地は必須です']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="previewData.sign_name"
                  label="申立者氏名"
                  :rules="[v => !!v || '申立者氏名は必須です']"
                />
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-form>
    </v-card-text>

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
import { ref, computed } from 'vue'

const props = defineProps<{
  initialData: {
    company_name: string
    department: string
    position: string
    applicant_name: string
    join_year: string
    join_month: string
    join_day: string
    work_hours: string
    work_days: string
    initial_work: string
    change_date: string
    current_status: string
    support_status: string
    episodes: string
    sign_year: string
    sign_month: string
    sign_day: string
    sign_company: string
    sign_address: string
    sign_name: string
  }
  caseId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// フォーム参照
const form = ref<any>(null)
const isValid = ref(false)

// アクティブなタブ
const activeTab = ref('basic')

// プレビューデータ（編集可能）
const previewData = ref({ ...props.initialData })

// 業務内容のテキスト
const workContent = computed({
  get: () => `入社当初は${previewData.value.initial_work}などの業務を担当していましたが、${previewData.value.change_date}より簡単なPC操作やゴミ捨てなど体力的、精神的負荷のかからない業務を担当させております。`,
  set: (val: string) => {
    // テキストから initial_work と change_date を抽出する処理を追加する場合はここに実装
  }
})

const generating = ref(false)
const showError = ref(false)
const errorMessage = ref('')

// キャンセル処理
const handleCancel = () => {
  emit('close')
}

// 保存処理
const handleSave = async () => {
  if (!form.value?.validate()) {
    errorMessage.value = '必須項目を入力してください'
    showError.value = true
    return
  }

  generating.value = true
  try {
    console.log('PdfPreview - Generating PDF with data:', {
      case_id: props.caseId,
      preview_data: previewData.value
    })

    const requestData = {
      case_id: props.caseId,
      form_data: {
        basic_info: {
          company_name: previewData.value.company_name,
          department: previewData.value.department,
          position: previewData.value.position,
          person_name: previewData.value.applicant_name,
          hire_date: `${previewData.value.join_year}-${previewData.value.join_month}-${previewData.value.join_day}`,
          daily_work_hours: previewData.value.work_hours,
          weekly_work_days: previewData.value.work_days,
          writer_name: previewData.value.sign_name,
          address: previewData.value.sign_address
        },
        disability_status: {
          work_capability: [previewData.value.initial_work],
          leaving_during_work: previewData.value.change_date,
          communication: previewData.value.current_status,
          work_performance: previewData.value.support_status.split('、')
        },
        episode: previewData.value.episodes
      }
    }

    console.log('PdfPreview - Sending request:', requestData)

    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'PDFの生成に失敗しました')
    }

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.error || 'PDFの生成に失敗しました')
    }

    // PDFのダウンロード
    const link = document.createElement('a')
    link.href = `data:application/pdf;base64,${result.data.pdf}`
    link.download = '就労状況申立書.pdf'
    link.click()

    // 成功したら閉じる
    emit('close')
  } catch (error) {
    console.error('Error generating PDF:', error)
    errorMessage.value = error instanceof Error ? error.message : 'PDFの生成に失敗しました'
    showError.value = true
  } finally {
    generating.value = false
  }
}
</script>

<style scoped>
.v-window {
  min-height: 400px;
}
</style> 