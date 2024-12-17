<template>
  <v-card class="mb-4">
    <v-card-title>会社情報</v-card-title>
    <v-card-text>
      <v-form @submit.prevent>
        <v-text-field
          v-model="store.companyInfo.name"
          label="会社名"
          required
        />
        <v-text-field
          v-model="store.companyInfo.postalCode"
          label="郵便番号"
          required
          placeholder="123-4567"
        />
        <v-text-field
          v-model="store.companyInfo.address"
          label="住所"
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