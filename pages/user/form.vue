<template>
  <v-container>
    <template v-if="isUsed">
      <v-alert
        type="info"
        text="このケースは既に保存されています"
      />
      <CaseViewer
        :case-data="savedCase"
        :hashtags="hashtags"
        @edit="handleEdit"
      />
    </template>
    <template v-else>
      <h1 class="text-h4 mb-6">ユーザーページ</h1>

      <!-- 編集不可の場合のメッセージ -->
      <v-alert
        v-if="!isEditable"
        type="warning"
        text="このフォームは編集できません"
        class="mb-4"
      />

      <v-row justify="center">
        <v-col cols="12" md="8">
          <BasicInfoForm :is-disabled="!isEditable" />
          <DisabilityStatusForm :is-disabled="!isEditable" />
          <ConsiderationsForm :is-disabled="!isEditable" />

          <v-card class="mb-4">
            <v-card-title>
              <v-icon start>mdi-text-box</v-icon>
              エピソード
            </v-card-title>
            <v-card-text>
              <v-textarea
                v-model="store.episode"
                label="エピソード"
                rows="10"
                :disabled="!isEditable"
                :hint="!store.episode ? 'フォームの入力内容から自動生成されます' : undefined"
                persistent-hint
              />
              <v-btn
                color="primary"
                class="mt-4"
                @click="handleGenerateEpisode"
                :loading="generating"
                :disabled="!hasAnyInput || !isEditable"
              >
                エピソードを生成
              </v-btn>
            </v-card-text>
          </v-card>

          <div class="d-flex justify-end pa-4">
            <v-btn
              color="primary"
              variant="outlined"
              class="mr-2"
              @click="handleSave(true)"
              :loading="saving"
              :disabled="!hasAnyInput || !isEditable"
            >
              一時保存
            </v-btn>
            <v-btn
              color="primary"
              @click="handleSave(false)"
              :loading="saving"
              :disabled="!isFormValid || !isEditable || !store.episode"
            >
              完了
            </v-btn>
          </div>
        </v-col>
      </v-row>

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
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { useUserFormStore } from '~/stores/userForm'
import BasicInfoForm from '~/components/user/BasicInfoForm.vue'
import DisabilityStatusForm from '~/components/user/DisabilityStatusForm.vue'
import ConsiderationsForm from '~/components/user/ConsiderationsForm.vue'
import CaseViewer from '~/components/user/CaseViewer.vue'

const store = useUserFormStore()
const saving = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('保存が完了しました')
const errorMessage = ref('')
const isUsed = ref(false)
const savedCase = ref(null)
const isEditable = ref(true)
const generating = ref(false)
const hashtags = ref([])

// リンクIDの取得と初期化処理
const route = useRoute()
const linkId = computed(() => {
  // linkまたはidパラメータを取得
  const id = route.query.link || route.query.id
  if (!id) {
    console.warn('No link ID provided in URL')
    return null
  }
  console.log('Link ID from URL:', id)
  return id as string
})

// フォームに何か入力があるかチェック
const hasAnyInput = computed(() => {
  const { basic_info, disability_status, considerations } = store

  // 本情報のチェック
  const hasBasicInfo = Object.values(basic_info).some(value => value !== '')

  // 障害の様子のチェック
  const hasDisabilityStatus = Object.entries(disability_status).some(([key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0
    }
    return value !== ''
  })

  // 配慮事項のチェック
  const hasConsiderations = Object.values(considerations).some(arr => arr.length > 0)

  return hasBasicInfo || hasDisabilityStatus || hasConsiderations || store.episode !== ''
})

// フォームのバリデーション
const isFormValid = computed(() => {
  const { basic_info, disability_status } = store
  return !!(
    basic_info.person_name &&
    basic_info.company_name &&
    basic_info.address &&
    basic_info.phone &&
    basic_info.position &&
    basic_info.writer_name &&
    basic_info.relationship &&
    basic_info.work_type &&
    basic_info.work_hours &&
    disability_status.lateness &&
    disability_status.early_leaving &&
    disability_status.sudden_absence &&
    disability_status.leaving_during_work &&
    disability_status.communication
  )
})

// 編集可否のチェック
const checkEditable = async () => {
  if (!linkId.value) {
    isEditable.value = false
    errorMessage.value = 'リンクIDが指定されていません。URLを確認してください。'
    showError.value = true
    return
  }

  try {
    console.log('Checking link:', linkId.value)
    const response = await $fetch<{
      success: boolean;
      error?: string;
      data?: {
        isActive: boolean;
        isUsed: boolean;
        savedCase?: any;
        hashtags?: any[];
      };
    }>(`/api/get-link-info?link=${linkId.value}`)
    
    console.log('API response:', response)

    if (!response.success) {
      isEditable.value = false
      errorMessage.value = response.error || 'リンク情報の取得に失敗しました'
      showError.value = true
      return
    }

    const data = response.data
    if (!data) {
      isEditable.value = false
      errorMessage.value = 'リンク情報の取得に失敗しました'
      showError.value = true
      return
    }

    // 編集可否の設定
    isEditable.value = true // デフォルトで編集可能
    if (data.isActive === false) {
      isEditable.value = false // 明示的に無効化されている場合のみfalse
      errorMessage.value = 'このリンクは無効化されています'
      showError.value = true
      return
    }
    
    isUsed.value = data.isUsed || false
    if (data.savedCase) {
      savedCase.value = data.savedCase
      // 保存データをフォームに反映
      const savedBasicInfo = data.savedCase.basic_info || {}
      
      // デバッグログを追加
      console.log('Full saved case data:', data.savedCase)
      console.log('Saved basic info:', savedBasicInfo)
      console.log('Current store state before patch:', store.$state)
      
      store.$patch({
        basic_info: {
          person_name: savedBasicInfo.person_name || '',
          company_name: savedBasicInfo.company_name || '',
          address: savedBasicInfo.address || '',
          phone: savedBasicInfo.phone || '',
          position: savedBasicInfo.position || '',
          writer_name: savedBasicInfo.writer_name || '',
          relationship: savedBasicInfo.relationship || '',
          work_type: savedBasicInfo.work_type || '',
          work_hours: savedBasicInfo.work_hours || ''
        },
        disability_status: {
          ...store.disability_status,
          ...(data.savedCase.disability_status || {})
        },
        considerations: {
          ...store.considerations,
          ...(data.savedCase.considerations || {})
        },
        episode: data.savedCase.episode || ''
      })

      // デッチ後の状態を確認
      console.log('Store state after patch:', store.$state)
    }
    if (data.hashtags) {
      hashtags.value = data.hashtags
    }

    console.log('Link status:', {
      linkId: linkId.value,
      isEditable: isEditable.value,
      isUsed: isUsed.value,
      isActive: data.isActive
    })
  } catch (e) {
    console.error('Error checking editable status:', e)
    isEditable.value = false
    errorMessage.value = e instanceof Error ? e.message : '編集権限の確認に失敗しました'
    showError.value = true
  }
}

// 保存処理
const handleSave = async (isDraft: boolean) => {
  if (!linkId.value) {
    errorMessage.value = 'リンクIDが指定されていません'
    showError.value = true
    return
  }

  // デバッグログを追加
  console.log('Current form data:', {
    basic_info: store.basic_info,
    disability_status: store.disability_status,
    considerations: store.considerations,
    episode: store.episode
  })

  // 一時保存時のバリデーション
  if (!store.validateBasicInfo(isDraft)) {
    errorMessage.value = isDraft ? '少なくとも1つのフィールドを入力してください' : '必須項目を入力してください'
    showError.value = true
    return  // 処理を中断
  }

  saving.value = true
  try {
    const formData = {
      basic_info: {
        person_name: store.basic_info.person_name,
        company_name: store.basic_info.company_name,
        address: store.basic_info.address,
        phone: store.basic_info.phone,
        position: store.basic_info.position,
        writer_name: store.basic_info.writer_name,
        relationship: store.basic_info.relationship,
        work_type: store.basic_info.work_type,
        work_hours: store.basic_info.work_hours
      },
      disability_status: store.disability_status,
      considerations: store.considerations,
      episode: store.episode,
      link_id: linkId.value,
      status: isDraft ? 'draft' : 'completed'
    }

    // デバッグログを追加
    console.log('Saving form data:', formData)

    const response = await $fetch('/api/save-user-case', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      showSuccess.value = true
      successMessage.value = isDraft ? '一時保存しました' : '保存が完了しました'
      // 保存成功後に編集可否を再チェック
      await checkEditable()
    } else {
      errorMessage.value = 'エラーが発生しました'
    }
  } catch (error) {
    console.error('Error saving case:', error)
    errorMessage.value = error instanceof Error ? error.message : '保存に失敗しました'
    showError.value = true
  } finally {
    saving.value = false
  }
}

// エピソード生成
const handleGenerateEpisode = async () => {
  generating.value = true
  try {
    await store.generateEpisode()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'エピソードの生成に失敗しました'
    showError.value = true
  } finally {
    generating.value = false
  }
}

// 初期データの取得
onMounted(async () => {
  console.log('Current URL:', window.location.href)
  console.log('Route query:', route.query)
  await checkEditable()
})

// 編集モードに切り替える
const handleEdit = () => {
  isUsed.value = false
  isEditable.value = true
}
</script>