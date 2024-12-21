<template>
  <v-app>
    <NuxtPage />
  </v-app>
</template>

<script setup lang="ts">
// グローバルエラーハンドリング
onErrorCaptured((err, instance, info) => {
  console.error('Captured error:', err)
  return false // エラーの伝播を停止
})
</script>