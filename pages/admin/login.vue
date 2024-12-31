<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="mt-5">
          <v-card-title class="text-center">
            {{ isLogin ? '管理者ログイン' : '管理者登録' }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="email"
                label="メールアドレス"
                type="email"
                required
                :rules="[v => !!v || 'メールアドレスは必須です']"
              />
              <v-text-field
                v-model="password"
                label="パスワード"
                type="password"
                required
                :rules="[
                  v => !!v || 'パスワードは必須です',
                  v => (v && v.length >= 6) || 'パスワードは6文字以上必要です'
                ]"
              />
              <v-btn
                type="submit"
                color="primary"
                block
                :loading="loading"
                class="mb-4"
              >
                {{ isLogin ? 'ログイン' : '登録' }}
              </v-btn>
              <div class="text-center">
                <v-btn
                  variant="text"
                  @click="toggleMode"
                  :disabled="loading"
                >
                  {{ isLogin ? '新規登録はこちら' : 'ログインはこちら' }}
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- エラーメッセージ -->
        <v-snackbar
          v-model="showError"
          color="error"
          timeout="3000"
        >
          {{ errorMessage }}
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const supabase = useSupabase()
const router = useRouter()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const loading = ref(false)
const showError = ref(false)
const errorMessage = ref('')

// ログイン/登録モードの切り替え
const toggleMode = () => {
  isLogin.value = !isLogin.value
  email.value = ''
  password.value = ''
}

// エラーメッセージの表示
const showErrorMessage = (message: string) => {
  errorMessage.value = message
  showError.value = true
}

// フォームの送信処理
const handleSubmit = async () => {
  if (!email.value || !password.value) {
    showErrorMessage('メールアドレスとパスワードを入力してください')
    return
  }

  if (password.value.length < 6) {
    showErrorMessage('パスワードは6文字以上必要です')
    return
  }

  loading.value = true
  try {
    if (isLogin.value) {
      // ログイン処理
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })

      if (error) throw error
    } else {
      // 新規登録処理
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            role: 'admin'
          }
        }
      })

      if (error) throw error

      showErrorMessage('確認メールを送信しました。メールを確認して登録を完了してください。')
      isLogin.value = true
      return
    }

    await router.push('/admin/dashboard')
  } catch (error) {
    console.error('Authentication error:', error)
    showErrorMessage(error instanceof Error ? error.message : 'エラーが発生しました')
  } finally {
    loading.value = false
  }
}
</script> 