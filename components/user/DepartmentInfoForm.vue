<template>
  <v-card class="mb-4">
    <v-card-title>部署・業務情報</v-card-title>
    <v-card-text>
      <v-form @submit.prevent>
        <v-text-field
          v-model="store.departmentInfo.name"
          label="部署名"
          required
        />
        <v-textarea
          v-model="store.departmentInfo.duties"
          label="業務内容"
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