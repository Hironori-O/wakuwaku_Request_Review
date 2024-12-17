<template>
  <v-app>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<script setup lang="ts">
import { useSupabase } from '~/composables/useSupabase'
import { useRouter } from 'vue-router'

const { supabase } = useSupabase()
const router = useRouter()

// グローバルエラーハンドリング
onErrorCaptured((err, instance, info) => {
  console.error('Captured error:', err)
  return false // エラーの伝播を停止
})

// セッション監視
onMounted(() => {
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event)
    
    if (event === 'SIGNED_OUT') {
      await router.push('/admin/login')
    }
  })
})
</script>