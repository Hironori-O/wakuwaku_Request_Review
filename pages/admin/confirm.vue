<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="mt-5">
          <v-card-title class="text-center">
            管理者登録の確認
          </v-card-title>
          <v-card-text>
            <div v-if="loading" class="text-center">
              <v-progress-circular indeterminate color="primary" />
              <p class="mt-4">登録を確認しています...</p>
            </div>
            <div v-else-if="error" class="text-center">
              <v-icon color="error" size="48" class="mb-4">mdi-alert-circle</v-icon>
              <p class="text-body-1">{{ error }}</p>
              <v-btn color="primary" to="/admin/login" class="mt-4">
                ログインページへ
              </v-btn>
            </div>
            <div v-else class="text-center">
              <v-icon color="success" size="48" class="mb-4">mdi-check-circle</v-icon>
              <p class="text-body-1">管理者登録が完了しました</p>
              <v-btn color="primary" to="/admin/login" class="mt-4">
                ログインページへ
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabase } from '~/composables/useSupabase'

const supabase = useSupabase()
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    // セッションの取得
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('Current session:', session)
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw sessionError
    }
    
    if (!session?.user) {
      console.error('No user in session')
      throw new Error('ユーザー情報が取得できません')
    }

    // 既存の登録をチェック
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select()
      .eq('auth_user_id', session.user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Check error:', checkError)
      throw checkError
    }

    if (existingUser) {
      console.log('User already registered:', existingUser)
      return
    }

    // admin_usersテーブルに登録
    const { data: adminUser, error: insertError } = await supabase
      .from('admin_users')
      .insert([
        {
          auth_user_id: session.user.id
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }

    console.log('Admin user registered:', adminUser)

  } catch (e) {
    console.error('Confirmation error:', e)
    error.value = e instanceof Error ? e.message : '確認処理に失敗しました'
  } finally {
    loading.value = false
  }
})
</script> 