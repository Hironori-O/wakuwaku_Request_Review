<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      エピソード
      <v-spacer />
      <v-btn
        color="primary"
        :loading="store.isGenerating"
        :disabled="!canGenerate"
        @click="generateEpisode"
      >
        生成
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-alert
        v-if="store.error"
        type="error"
        class="mb-4"
      >
        {{ store.error }}
      </v-alert>

      <v-textarea
        v-model="store.generatedEpisode"
        label="生成されたエピソード"
        rows="10"
        auto-grow
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useUserFormStore } from '~/stores/userForm'

const store = useUserFormStore()

const canGenerate = computed(() => {
  return store.companyInfo.name &&
         store.departmentInfo.name &&
         store.departmentInfo.duties &&
         store.employeeInfo.joinDate &&
         store.employeeInfo.workFrequency &&
         store.selectedHashtags.length > 0
})

const generateEpisode = async () => {
  if (!canGenerate.value) {
    store.error = '必要な情報を入力してください'
    return
  }
  await store.generateEpisode()
}
</script>