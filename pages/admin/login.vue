<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="mt-4">
          <v-card-title class="text-center">
            {{ isRegister ? '新規管理者登録' : 'ログイン' }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleSubmit" ref="form">
              <v-text-field
                v-model="email"
                label="メールアドレス"
                type="email"
                required
                :rules="[v => !!v || 'メールアドレスは必須です']"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="password"
                label="パスワード"
                type="password"
                required
                :rules="[v => !!v || 'パスワードは必須です']"
                variant="outlined"
                density="comfortable"
              />
              <v-alert
                v-if="error"
                type="error"
                class="mb-4"
              >
                {{ error }}
              </v-alert>
              <div class="d-flex justify-center flex-column">
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="loading"
                  :disabled="!email || !password"
                  class="mb-4"
                >
                  {{ isRegister ? '登録' : 'ログイン' }}
                </v-btn>
                <v-btn
                  v-if="!isRegister"
                  variant="text"
                  color="primary"
                  @click="handleForgotPassword"
                  :disabled="!email || loading"
                  class="mb-2"
                >
                  パスワードを忘れた場合
                </v-btn>
                <v-btn
                  variant="text"
                  color="primary"
                  @click="isRegister = !isRegister"
                  :disabled="loading"
                >
                  {{ isRegister ? 'ログインする' : '新規登録' }}
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- パスワードリセットダイアログ -->
        <v-dialog v-model="showResetDialog" max-width="400">
          <v-card>
            <v-card-title>パスワードリセット</v-card-title>
            <v-card-text>
              <p class="mb-4">パスワードリセット用のリンクをメールで送信します。</p>
              <v-text-field
                v-model="resetEmail"
                label="メールアドレス"
                type="email"
                required
                variant="outlined"
                density="comfortable"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="grey"
                variant="text"
                @click="showResetDialog = false"
              >
                キャンセル
              </v-btn>
              <v-btn
                color="primary"
                @click="handleResetPassword"
                :loading="resetting"
                :disabled="!resetEmail"
              >
                送信
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- 成功メッセージ -->
        <v-snackbar
          v-model="showSuccess"
          color="success"
          timeout="5000"
        >
          {{ successMessage }}
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useSupabase } from '~/composables/useSupabase'

const { supabase } = useSupabase()
const router = useRouter()

const form = ref()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const isRegister = ref(false)
const showResetDialog = ref(false)
const resetEmail = ref('')
const resetting = ref(false)
const showSuccess = ref(false)
const successMessage = ref('')

// 成功メッセージを表示
const showSuccessMessage = (message: string) => {
  successMessage.value = message
  showSuccess.value = true
}

// ログインまたは新規登録
const handleSubmit = async () => {
  if (!form.value) return
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    if (isRegister.value) {
      // 新規登録
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`
        }
      })

      if (signUpError) throw signUpError

      showSuccessMessage('確認メールを送信しました。メールを確認してください。')
      isRegister.value = false
    } else {
      // ログイン
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })

      if (signInError) throw signInError

      // 管理者権限の確認
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select()
        .eq('id', data.user.id)
        .single()

      if (adminError || !adminData) {
        await supabase.auth.signOut()
        throw new Error('管理者権限がありません')
      }

      router.push('/admin/dashboard')
    }
  } catch (e) {
    console.error('Auth error:', e)
    error.value = e instanceof Error ? e.message : '認証に失敗しました'
  } finally {
    loading.value = false
  }
}

// パスワードリセットダイアログを表示
const handleForgotPassword = () => {
  resetEmail.value = email.value
  showResetDialog.value = true
}

// パスワードリセット
const handleResetPassword = async () => {
  resetting.value = true
  try {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      resetEmail.value,
      {
        redirectTo: `${window.location.origin}/admin/reset-password`
      }
    )

    if (resetError) throw resetError

    showResetDialog.value = false
    showSuccessMessage('パスワードリセット用のメールを送信しました')
  } catch (e) {
    console.error('Reset password error:', e)
    error.value = e instanceof Error ? e.message : 'パスワードリセットに失敗しました'
  } finally {
    resetting.value = false
  }
}

// ページタイトルの設定
useHead({
  title: isRegister.value ? '新規管理者登録' : '管理者ログイン'
})
</script> 