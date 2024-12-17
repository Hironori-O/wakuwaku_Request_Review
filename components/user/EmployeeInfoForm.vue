<template>
  <v-card class="mb-4">
    <v-card-title>従業員情報</v-card-title>
    <v-card-text>
      <v-form @submit.prevent>
        <v-text-field
          v-model="store.employeeInfo.requester"
          label="請求者"
          required
        />
        <v-text-field
          v-model="store.employeeInfo.joinDate"
          label="入社日"
          type="date"
          required
        />
        <v-select
          v-model="store.employeeInfo.workFrequency"
          label="勤務頻度"
          :items="['週5日', '週4日', '週3日以下', 'その他']"
          required
        />
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useUserFormStore } from '~/stores/userForm'

const store = useUserFormStore()
</script>