<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex align-center">
      <v-icon start class="mr-2">mdi-account-circle</v-icon>
      基本情報
    </v-card-title>
    <v-card-text>
      <v-form ref="form">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="store.basic_info.person_name"
              label="名前（本人）"
              :rules="[v => !!v || '名前（本人）は必須です']"
              required
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="store.basic_info.company_name"
              label="会社名"
              :rules="[v => !!v || '会社名は必須です']"
              required
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="store.basic_info.address"
              label="住所"
              :rules="[v => !!v || '住所は必須です']"
              required
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="store.basic_info.phone"
              label="電話番号"
              :rules="[v => !!v || '電話番号は必須です']"
              required
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="store.basic_info.position"
              label="記入者の役職"
              :rules="[v => !!v || '記入者の役職は必須です']"
              required
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="store.basic_info.writer_name"
              label="記入者の氏名"
              :rules="[v => !!v || '記入者の氏名は必須です']"
              required
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="store.basic_info.relationship"
              label="本人との関係"
              :items="relationshipOptions"
              :rules="[v => !!v || '本人との関係は必須です']"
              required
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="store.basic_info.work_type"
              label="勤務形態"
              :items="workTypeOptions"
              :rules="[v => !!v || '勤務形態は必須です']"
              required
              :disabled="isDisabled"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="store.basic_info.work_hours"
              label="勤務時間"
              :items="workHoursOptions"
              :rules="[v => !!v || '勤務時間は必須です']"
              required
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

const relationshipOptions = [
  '上司',
  '社長'
]

const workTypeOptions = [
  '一般雇用',
  'サポートが必要な働き方',
  '障害者雇用'
]

const workHoursOptions = [
  'フルタイム',
  '週30〜40時間未満',
  '週20〜30時間未満',
  '週10〜20時間未満',
  '週10時間未満'
]
</script> 