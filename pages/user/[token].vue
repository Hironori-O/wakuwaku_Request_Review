<template>
  <!-- このページは自動的にform.vueにリダイレクトします -->
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// トークンを取得してform.vueにリダイレクト
const token = route.params.token as string
router.replace({
  path: '/user/form',
  query: { id: token }
})
</script> 