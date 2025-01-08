<template>
  <v-container>
    <v-row justify="space-between" align="center" class="mb-4">
      <v-col>
        <h1 class="text-h4">管理者ダッシュボード</h1>
      </v-col>
      <v-col cols="auto" class="d-flex align-center">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="showAddUserDialog = true"
          class="mr-4"
        >
          ユーザー追加
        </v-btn>
        <v-btn
          color="error"
          prepend-icon="mdi-logout"
          @click="handleLogout"
        >
          ログアウト
        </v-btn>
      </v-col>
    </v-row>

    <!-- ユーザー一覧テーブル -->
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon start>mdi-account-multiple</v-icon>
        ユーザー管理
        <v-spacer />
        <v-text-field
          v-model="search"
          append-inner-icon="mdi-magnify"
          label="検索"
          single-line
          hide-details
          density="compact"
          class="ml-4"
          style="max-width: 300px;"
        />
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="userList"
          :search="search"
          :loading="loading"
          class="elevation-1"
        >
          <template #[`item.url`]="{ item }">
            <div class="d-flex align-center">
              <v-btn
                variant="text"
                density="compact"
                color="primary"
                @click="handleCopyUrl(item.url)"
                class="mr-2 pa-0"
                icon
                :loading="item.id === copyingItemId"
              >
                <v-icon size="small">mdi-content-copy</v-icon>
              </v-btn>
              <span class="text-truncate" style="max-width: 300px;">{{ item.url }}</span>
            </div>
          </template>
          <template #[`item.status`]="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              class="px-2"
            >
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>
          <template #[`item.editable`]="{ item }">
            <div class="d-flex justify-center">
              <v-switch
                v-model="item.editable"
                density="compact"
                color="primary"
                @change="updateEditable(item)"
                hide-details
                class="ma-0 pa-0"
              />
            </div>
          </template>
          <template #[`item.actions`]="{ item }">
            <div class="d-flex justify-center">
              <v-btn
                variant="text"
                color="primary"
                density="compact"
                :href="item.url"
                target="_blank"
                class="mr-2"
                icon
              >
                <v-icon size="small">mdi-open-in-new</v-icon>
              </v-btn>
              <v-btn
                variant="text"
                color="error"
                density="compact"
                @click="confirmDelete(item)"
                icon
              >
                <v-icon size="small">mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- ユーザー追加ダイアログ -->
    <v-dialog v-model="showAddUserDialog" max-width="500">
      <v-card>
        <v-card-title>新規ユーザー追加</v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="handleAddUser">
            <v-text-field
              v-model="newUser.email"
              label="メールアドレス"
              type="email"
              required
              :rules="[v => !!v || 'メールアドレスは必須です']"
            />
            <v-textarea
              v-model="newUser.comment"
              label="コメント"
              rows="3"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="showAddUserDialog = false"
          >
            キャンセル
          </v-btn>
          <v-btn
            color="primary"
            @click="handleAddUser"
            :loading="addingUser"
          >
            追加
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- URL表示モーダル -->
    <v-dialog v-model="showUrlDialog" max-width="500">
      <v-card>
        <v-card-title>生成されたURL</v-card-title>
        <v-card-text>
          <div class="d-flex align-center">
            <v-text-field
              ref="urlInput"
              v-model="generatedUrl"
              readonly
              class="flex-grow-1"
              persistent-hint
              hint="このURLをコピーして共有してください"
              @click="selectUrlText"
            />
            <v-btn
              color="primary"
              icon
              class="ml-2"
              @click="copyToClipboard"
              :loading="copying"
            >
              <v-icon>mdi-content-copy</v-icon>
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="showUrlDialog = false"
          >
            閉じる
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 削除確認ダイアログ -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          削除の確認
        </v-card-title>
        <v-card-text>
          <p>以下のユーザーを削除してもよろしいですか？</p>
          <p class="font-weight-bold">{{ deleteTarget?.email }}</p>
          <p class="text-caption">この操作は取り消せません。</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="showDeleteDialog = false"
          >
            {{ cancelButtonText }}
          </v-btn>
          <v-btn
            color="error"
            @click="handleDelete"
            :loading="deleting"
          >
            {{ deleteButtonText }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- スナックバー -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="3000"
    >
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { useSupabase } from '~/composables/useSupabase'
import { useRouter, useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'

// インターフェースの定義
interface UserLink {
  id: string
  email: string
  url: string
  status: 'pending' | 'draft' | 'completed'
  editable: boolean
  comment: string
  created_at: string
  updated_at: string
}

type DataTableHeader = {
  title: string
  key: keyof UserLink | 'actions'
  align?: 'start' | 'center' | 'end'
  width?: string
  sortable?: boolean
}

const router = useRouter()
const route = useRoute()
const supabase = useSupabase()

// 状態管理
const loading = ref(false)
const userList = ref<UserLink[]>([])
const search = ref('')
const showAddUserDialog = ref(false)
const showUrlDialog = ref(false)
const showDeleteDialog = ref(false)
const addingUser = ref(false)
const copying = ref(false)
const copyingItemId = ref<string | null>(null)
const deleting = ref(false)
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const generatedUrl = ref('')
const deleteTarget = ref<UserLink | null>(null)
const form = ref()
const urlInput = ref()

const newUser = ref({
  email: '',
  comment: ''
})

// 削除確認ダイアログのボタンテキスト
const cancelButtonText = '取り消し'
const deleteButtonText = '削除'

// テーブルヘッダー
const headers: DataTableHeader[] = [
  { title: 'メールアドレス', key: 'email', align: 'start' },
  { title: 'URL', key: 'url', width: '300px', align: 'start' },
  { title: '状態', key: 'status', align: 'center' },
  { title: '編集可能', key: 'editable', align: 'center' },
  { title: 'コメント', key: 'comment', align: 'start' },
  { title: '操作', key: 'actions', align: 'center', sortable: false }
]

// ステタス表示用の関数
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'draft':
      return 'warning'
    case 'pending':
      return 'info'
    default:
      return 'grey'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return '完了'
    case 'draft':
      return '下書き'
    case 'pending':
      return '未回答'
    default:
      return '不明'
  }
}

// ユーザー一覧の取得
const fetchUserList = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('user_links')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    userList.value = data.map(item => ({
      ...item,
      url: `${window.location.origin}/user/${item.id}`
    }))
  } catch (error) {
    console.error('Error fetching user list:', error)
    showSnackbarMessage('ユーザー一覧の取得に失敗しました', 'error')
  } finally {
    loading.value = false
  }
}

// 新規ユーザー追加
const handleAddUser = async () => {
  if (!form.value) return
  const { valid } = await form.value.validate()
  if (!valid) return

  addingUser.value = true
  try {
    const { data, error } = await supabase
      .from('user_links')
      .insert([
        {
          email: newUser.value.email,
          comment: newUser.value.comment,
          editable: true
        }
      ])
      .select()
      .single()

    if (error) throw error

    showAddUserDialog.value = false
    newUser.value = { email: '', comment: '' }
    showSnackbarMessage('ユーザーを追加しました')
    
    // URLの表示
    generatedUrl.value = `${window.location.origin}/user/${data.id}`
    showUrlDialog.value = true
    
    await fetchUserList()
  } catch (error) {
    console.error('Error adding user:', error)
    showSnackbarMessage('ユーザーの追加に失敗しました', 'error')
  } finally {
    addingUser.value = false
  }
}

// URLのコピー
const handleCopyUrl = async (url: string) => {
  const itemId = url.split('/').pop()
  if (!itemId) return

  copyingItemId.value = itemId
  try {
    await navigator.clipboard.writeText(url)
    showSnackbarMessage('URLをコピーしました')
  } catch (error) {
    console.error('Error copying URL:', error)
    showSnackbarMessage('URLのコピーに失敗しました', 'error')
  } finally {
    copyingItemId.value = null
  }
}

// 編集可否の更新
const updateEditable = async (item: UserLink) => {
  try {
    const { error } = await supabase
      .from('user_links')
      .update({ editable: item.editable })
      .eq('id', item.id)

    if (error) throw error

    showSnackbarMessage('設定を更新しました')
  } catch (error) {
    console.error('Error updating editable:', error)
    showSnackbarMessage('設定の更新に失敗しました', 'error')
    item.editable = !item.editable // 元に戻す
  }
}

// 削除確認
const confirmDelete = (item: UserLink) => {
  deleteTarget.value = item
  showDeleteDialog.value = true
}

// 削除実行
const handleDelete = async () => {
  if (!deleteTarget.value) return

  deleting.value = true
  try {
    const { error } = await supabase
      .from('user_links')
      .delete()
      .eq('id', deleteTarget.value.id)

    if (error) throw error

    showDeleteDialog.value = false
    showSnackbarMessage('ユーザーを削除しました')
    await fetchUserList()
  } catch (error) {
    console.error('Error deleting user:', error)
    showSnackbarMessage('ユーザーの削除に失敗しました', 'error')
  } finally {
    deleting.value = false
  }
}

// ログアウト
const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    await router.push('/admin/login')
  } catch (error) {
    console.error('Error signing out:', error)
    showSnackbarMessage('ログアウトに失敗しました', 'error')
  }
}

// スナックバーメッセージの表示
const showSnackbarMessage = (message: string, color: string = 'success') => {
  snackbarText.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// URLのテキスト選択
const selectUrlText = () => {
  if (urlInput.value?.$el) {
    const input = urlInput.value.$el.querySelector('input')
    input?.select()
  }
}

// クリップボードにコピー
const copyToClipboard = async () => {
  copying.value = true
  try {
    await navigator.clipboard.writeText(generatedUrl.value)
    showSnackbarMessage('URLをコピーしました')
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    showSnackbarMessage('URLのコピーに失敗しました', 'error')
  } finally {
    copying.value = false
  }
}

// 初期データの取得
onMounted(async () => {
  await fetchUserList()
})

// ページタイトルの設定
useHead({
  title: '管理者ダッシュボード'
})
</script>
