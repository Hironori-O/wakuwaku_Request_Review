<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="mt-4">
          <v-card-title class="text-center">
            パスワードの再設定
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleResetPassword" ref="form">
              <v-text-field
                v-model="email"
                label="メールアドレス"
                type="email"
                required
                :rules="[v => !!v || 'メールアドレスは必須です']"
                variant="outlined"
                density="comfortable"
                :disabled="!!token"
              />
              <v-text-field
                v-model="password"
                label="新しいパスワード"
                type="password"
                required
                :rules="[
                  v => !!v || 'パスワードは必須です',
                  v => v.length >= 8 || 'パスワードは8文字以上必要です'
                ]"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="confirmPassword"
                label="パスワードの確認"
                type="password"
                required
                :rules="[
                  v => !!v || 'パスワードの確認は必須です',
                  v => v === password || 'パスワードが一致しません'
                ]"
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
              <div class="d-flex justify-center">
                <v-btn
                  type="submit"
                  color="primary"
                  :loading="loading"
                  :disabled="!isValid"
                >
                  {{ token ? 'パスワードを更新' : 'リセットメールを送信' }}
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

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
const router = useRouter()
const route = useRoute()
const supabase = useSupabase()

const form = ref()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const showSuccess = ref(false)
const successMessage = ref('')
const token = ref('')

// URLからトークンを取得
onMounted(() => {
  const hash = window.location.hash
  if (hash) {
    const params = new URLSearchParams(hash.substring(1))
    token.value = params.get('access_token') || ''
    
    // トークンがある場合はメールアドレスを取得
    if (token.value) {
      getEmailFromToken()
    }
  }
})

// トークンからメールアドレスを取得
const getEmailFromToken = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(token.value)
    if (userError) throw userError
    if (user) {
      email.value = user.email || ''
    }
  } catch (e) {
    console.error('Error getting user:', e)
    error.value = 'トークンが無効です'
  }
}

// フォームのバリデーション
const isValid = computed(() => {
  if (token.value) {
    return !!password.value && !!confirmPassword.value && password.value === confirmPassword.value
  }
  return !!email.value
})

const handleResetPassword = async () => {
  if (!form.value) return
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    if (token.value) {
      // パスワードの更新
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.value
      })

      if (updateError) throw updateError

      successMessage.value = 'パスワードを更新しました。ログインページに移動します。'
      showSuccess.value = true
      setTimeout(() => {
        router.push('/admin/login')
      }, 2000)
    } else {
      // リセットメールの送信
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.value,
        {
          redirectTo: `${window.location.origin}/admin/reset-password`
        }
      )

      if (resetError) throw resetError

      successMessage.value = 'パスワードリセット用のメールを送信しました'
      showSuccess.value = true
      email.value = ''
    }
  } catch (e) {
    console.error('Password reset error:', e)
    error.value = e instanceof Error ? e.message : 'パスワードのリセットに失敗しました'
  } finally {
    loading.value = false
  }
}

// ページタイトルの設定
useHead({
  title: 'パスワードの再設定'
})
</script> 