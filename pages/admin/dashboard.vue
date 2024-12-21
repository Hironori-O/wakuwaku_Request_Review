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
import { useRouter } from 'vue-router'
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
  last_updated?: string
  hashtags: string[]
  user_cases?: Array<{
    status: string
    updated_at: string
  }>
}

const supabase = useSupabase()
const router = useRouter()

// ボタンテキストの定義
const cancelButtonText = 'キャンセル'
const deleteButtonText = '削除'

// 状態管理（型定義を追加）
const loading = ref(false)
const search = ref('')
const userList = ref<UserLink[]>([])
const showAddUserDialog = ref(false)
const showUrlDialog = ref(false)
const addingUser = ref(false)
const generatedUrl = ref('')
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const form = ref()
const showDeleteDialog = ref(false)
const deleteTarget = ref<UserLink | null>(null)
const deleting = ref(false)
const copyingItemId = ref<string | null>(null)
const copying = ref(false)
const urlInput = ref<any>(null)

// 新規ユーザー情報
const newUser = ref({
  email: '',
  comment: ''
})

// テーブルヘッダー
const headers = [
  { 
    title: 'メールアドレス',
    key: 'email',
    sortable: true,
    align: 'start' as const,
    width: '25%'
  },
  {
    title: 'URL',
    key: 'url',
    sortable: false,
    align: 'start' as const,
    width: '35%'
  },
  {
    title: 'ステータス',
    key: 'status',
    sortable: true,
    align: 'center' as const,
    width: '10%'
  },
  {
    title: '編集可能',
    key: 'editable',
    sortable: true,
    align: 'center' as const,
    width: '10%'
  },
  {
    title: 'コメント',
    key: 'comment',
    sortable: false,
    align: 'start' as const,
    width: '15%'
  },
  {
    title: '操作',
    key: 'actions',
    sortable: false,
    align: 'center' as const,
    width: '5%'
  }
]

// ユーザー一覧��取得
const fetchUserList = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('user_links')
      .select(`
        *,
        user_cases (
          status,
          updated_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // データの整形
    userList.value = data.map(item => ({
      ...item,
      url: `${window.location.origin}/user/form?link=${item.id}`,
      status: item.user_cases?.[0]?.status || item.status || 'pending',
      last_updated: item.user_cases?.[0]?.updated_at || item.updated_at
    }))
  } catch (error) {
    console.error('Error fetching user list:', error)
    showError('ユーザー一覧の取得に失敗しました')
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
    console.log('Adding new user:', newUser.value)

    // URLの生成と保存
    const { data, error } = await supabase
      .from('user_links')
      .insert([{
        email: newUser.value.email,
        comment: newUser.value.comment || '',
        editable: true,
        status: 'pending',
        hashtags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    if (!data) {
      throw new Error('データの保存に失敗しました')
    }

    console.log('Saved user data:', data)

    // 生成されたURLの表示
    generatedUrl.value = `${window.location.origin}/user/form?link=${data.id}`
    showAddUserDialog.value = false
    showUrlDialog.value = true
    
    // 一覧の更新
    await fetchUserList()
    
    // フォームのリセット
    newUser.value = { email: '', comment: '' }
    
    showSuccess('ユーザーを追加しました')
  } catch (error) {
    console.error('Error adding user:', error)
    showError(error instanceof Error ? error.message : 'ユーザーの追加に失敗しました')
  } finally {
    addingUser.value = false
  }
}

// テキスト選択用の関数
const selectUrlText = () => {
  const input = urlInput.value?.$el.querySelector('input')
  if (input) {
    input.select()
  }
}

// モーダル用のコピー機能
const copyToClipboard = async () => {
  if (!generatedUrl.value) {
    showError('URLが指定されていません')
    return
  }

  copying.value = true
  try {
    // まずClipboard APIを試す
    try {
      await navigator.clipboard.writeText(generatedUrl.value)
      showSuccess('URLをコピーしました')
      return
    } catch (clipboardError) {
      console.warn('Clipboard API failed:', clipboardError)
    }

    // フォールバック: input要素を使用
    const input = urlInput.value?.$el.querySelector('input')
    if (!input) {
      throw new Error('入力要素が見つかりません')
    }

    // テキストを選択してコピー
    input.select()
    const success = document.execCommand('copy')
    
    if (success) {
      showSuccess('URLをコピーしました')
    } else {
      throw new Error('コピーに失敗しました')
    }
  } catch (error) {
    console.error('Copy error:', error)
    showError(error instanceof Error ? error.message : 'URLのコピーに失敗しました')
  } finally {
    copying.value = false
  }
}

// データテーブル用のコピー機能
const handleCopyUrl = async (url: string): Promise<void> => {
  if (!url) {
    showError('URLが指定されていません')
    return
  }

  const item = userList.value.find((i: UserLink) => i.url === url)
  if (item) {
    copyingItemId.value = item.id
  }

  try {
    await navigator.clipboard.writeText(url)
    showSuccess('URLをコピーしました')
  } catch (clipboardError) {
    console.warn('Clipboard API failed:', clipboardError)
    
    // フォールバック: テキストエリアを使用
    const textArea = document.createElement('textarea')
    textArea.value = url
    
    // スタイル設定
    Object.assign(textArea.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '2em',
      height: '2em',
      padding: '0',
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
      background: 'transparent',
      opacity: '0'
    })
    
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      const success = document.execCommand('copy')
      if (success) {
        showSuccess('URLをコピーしました')
      } else {
        throw new Error('コピーに失敗しました')
      }
    } catch (error) {
      console.error('Copy error:', error)
      showError('URLのコピーに失敗しました')
    } finally {
      document.body.removeChild(textArea)
    }
  } finally {
    copyingItemId.value = null
  }
}

// 編集可否の更新
const updateEditable = async (item: UserLink) => {
  try {
    loading.value = true
    const { error } = await supabase
      .from('user_links')
      .update({ 
        editable: item.editable,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id)

    if (error) {
      throw error
    }

    showSuccess(`編集${item.editable ? '可能' : '不可'}に設定しました`)
    
    // 一覧を更新して最新の状態を反映
    await fetchUserList()
  } catch (error) {
    console.error('Error updating editable:', error)
    showError('更新に失敗しました')
    // エラーの場合は状態を元に戻す
    item.editable = !item.editable
  } finally {
    loading.value = false
  }
}

// ステータスの表示テキストを取得
const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed':
      return '回答済み'
    case 'draft':
      return '回答中'
    case 'pending':
      return '未回答'
    default:
      return '不明'
  }
}

// ステータスの色を取得
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'draft':
      return 'warning'
    case 'pending':
      return 'error'
    default:
      return 'grey'
  }
}

// スナックバー表示用ヘルパー関数
const showSuccess = (text: string): void => {
  snackbarColor.value = 'success'
  snackbarText.value = text
  showSnackbar.value = true
}

const showError = (text: string): void => {
  snackbarColor.value = 'error'
  snackbarText.value = text
  showSnackbar.value = true
}

// 削除確認ダイアログを表示
const confirmDelete = (item: UserLink): void => {
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

    // 一覧を更新
    await fetchUserList()
    showSuccess('ユーザーを削除しました')
    showDeleteDialog.value = false
    deleteTarget.value = null
  } catch (error) {
    console.error('Delete error:', error)
    showError('削除に失敗しました')
  } finally {
    deleting.value = false
  }
}

// ログアウト処理
const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push('/admin/login')
  } catch (error) {
    console.error('Logout error:', error)
    showError('ログアウトに失敗しました')
  }
}

// 初期データの取得
onMounted(async () => {
  await fetchUserList()
})
</script>
