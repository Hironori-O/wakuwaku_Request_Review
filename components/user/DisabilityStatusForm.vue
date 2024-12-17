<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex align-center">
      <v-icon start class="mr-2">mdi-account-alert</v-icon>
      障害の様子
    </v-card-title>
    <v-card-text>
      <v-form ref="form">
        <v-row>
          <v-col cols="6">
            <v-select
              v-model="store.disability_status.lateness"
              label="遅刻"
              :items="frequencyOptions"
              :rules="[v => !!v || '遅刻の状況は必須です']"
              required
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="store.disability_status.early_leaving"
              label="早退"
              :items="frequencyOptions"
              :rules="[v => !!v || '早退の状況は必須です']"
              required
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="store.disability_status.sudden_absence"
              label="急な休み"
              :items="frequencyOptions"
              :rules="[v => !!v || '急な休みの状況は必須です']"
              required
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="store.disability_status.leaving_during_work"
              label="仕事の途中で抜けること"
              :items="frequencyOptions"
              :rules="[v => !!v || '仕事の途中で抜けることの状況は必須です']"
              required
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="store.disability_status.communication"
              label="同僚とのコミュニケーション"
              :items="communicationOptions"
              :rules="[v => !!v || 'コミュニケーションの状況は必須です']"
              required
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="store.disability_status.work_capability"
              label="作業能力"
              :items="workCapabilityOptions"
              multiple
              chips
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="store.disability_status.work_performance"
              label="業務遂行能力"
              :items="workPerformanceOptions"
              multiple
              chips
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useUserFormStore } from '~/stores/userForm'

const store = useUserFormStore()

const props = defineProps<{
  isDisabled?: boolean
}>()

const frequencyOptions = [
  'まったくない',
  'たまにある',
  'よくある'
]

const communicationOptions = [
  '全く問題なし',
  'たまにフォローが必要（報連相などができない場面がある）',
  'フォローが必要（報告・連絡・相談・質問、雑談、双方向の意思疎通などができない）'
]

const workCapabilityOptions = [
  '綿密な作業が困難',
  '正確な作業が困難',
  '作業効率が悪い',
  '作業スピードがゆっくり',
  'ミスがみられる'
]

const workPerformanceOptions = [
  '集中力が持続しない',
  '過集中で周りが見えなくなる',
  '臨機応変な対応は困難',
  '作業計画・立案、優先順位付けが困難',
  '職場ルールから逸脱する場面がある'
]
</script> 