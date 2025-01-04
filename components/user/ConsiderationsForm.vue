<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex align-center">
      <v-icon start class="mr-2">mdi-hand-heart</v-icon>
      配慮事項
    </v-card-title>
    <v-card-text>
      <v-form ref="form">
        <v-row>
          <v-col cols="12">
            <v-combobox
              v-model="store.considerations.physical_environment"
              label="物理的環境"
              :items="physicalEnvironmentOptions"
              multiple
              chips
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-combobox
              v-model="store.considerations.work_considerations"
              label="作業上の配慮"
              :items="workConsiderationsOptions"
              multiple
              chips
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-combobox
              v-model="store.considerations.communication_support"
              label="コミュニケーション支援"
              :items="communicationSupportOptions"
              multiple
              chips
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-combobox
              v-model="store.considerations.human_support"
              label="人的支援"
              :items="humanSupportOptions"
              multiple
              chips
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-combobox
              v-model="store.considerations.health_safety"
              label="健康・安全管理"
              :items="healthSafetyOptions"
              multiple
              chips
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-combobox
              v-model="store.considerations.career_development"
              label="キャリア形成"
              :items="careerDevelopmentOptions"
              multiple
              chips
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-combobox
              v-model="store.considerations.mental_support"
              label="メンタルヘルス"
              :items="mentalSupportOptions"
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

const physicalEnvironmentOptions = [
  '職場のバリアフリー化（車椅子での移動、トイレ、通路の確保）',
  '必要に応じた作業・休憩スペースの調整',
  '適切な照明や音環境の整備',
  '在宅勤務の許可',
  '通勤時の送迎'
]

const workConsiderationsOptions = [
  '個人の能力と障害特性に合わせた業務内容・量の調整',
  '柔軟な勤務形態（在宅勤務、フレックスタイム、短時間勤務）',
  '専用業務マニュアルの整備',
  '必要な補助機器の提供（拡大読み取り器、音声読み上げソフト、特殊なキーボードなど）'
]

const communicationSupportOptions = [
  '手話通訳や要約筆記などの支援',
  '言語・非言語を用いたわかりやすい指示や説明',
  '個々の特性に合わせたコミュニケーション方法の工夫'
]

const humanSupportOptions = [
  '専任のサポート担当者の配置',
  '同僚への障害理解の研修・周知',
  'メンター制度の導入'
]

const healthSafetyOptions = [
  '定期的な健康相談',
  '安全な作業環境の確保',
  '必要に応じた医療的配慮'
]

const careerDevelopmentOptions = [
  '能力開発の機会',
  'キャリアパスの明確化',
  '公平な評価制度'
]

const mentalSupportOptions = [
  'ストレス具合の配慮',
  'プライバシーの尊重',
  'インクルーシブな職場文化の醸成'
]
</script> 