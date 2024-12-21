<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="mt-5">
          <v-card-title class="text-center">
            管理者ログイン
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="メールアドレス"
                type="email"
                required
              />
              <v-text-field
                v-model="password"
                label="パスワード"
                type="password"
                required
              />
              <v-btn
                type="submit"
                color="primary"
                block
                :loading="loading"
              >
                ログイン
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const supabase = useSupabase()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    alert('メールアドレスとパスワードを入力してください')
    return
  }

  try {
    loading.value = true
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) throw error

    await router.push('/admin/dashboard')
  } catch (error) {
    console.error('Login error:', error)
    alert('ログインに失敗しました')
  } finally {
    loading.value = false
  }
}
</script> 