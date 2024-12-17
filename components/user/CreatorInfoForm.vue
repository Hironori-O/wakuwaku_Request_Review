<template>
  <v-card class="mb-4">
    <v-card-title>作成者情報</v-card-title>
    <v-card-text>
      <v-form @submit.prevent>
        <v-text-field
          v-model="store.creatorInfo.department"
          label="部署"
          required
        />
        <v-text-field
          v-model="store.creatorInfo.name"
          label="名前"
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