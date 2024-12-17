<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">ユーザーページ</h1>
      </v-col>

      <v-col cols="12" md="6">
        <UserCompanyInfoForm />
        <UserDepartmentInfoForm />
        <UserEmployeeInfoForm />
        <UserCreatorInfoForm />
      </v-col>

      <v-col cols="12" md="6">
        <UserHashtagSelector />
        <UserEpisodeGenerator />

        <div class="mt-4 d-flex justify-end">
          <v-btn
            color="primary"
            :loading="saving"
            @click="saveForm"
          >
            保存
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="showSuccessMessage"
      color="success"
      timeout="3000"
    >
      保存しました
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { useUserFormStore } from '~/stores/userForm'

const route = useRoute()
const store = useUserFormStore()

const saving = ref(false)
const showSuccessMessage = ref(false)

// トークンの取得
const token = route.params.token as string

const saveForm = async () => {
  saving.value = true
  try {
    const success = await store.saveForm()
    if (success) {
      showSuccessMessage.value = true
    }
  } finally {
    saving.value = false
  }
}

// TODO: トークンを使用してユーザーデータを取得
onMounted(async () => {
  console.log('Token:', token)
})
</script>