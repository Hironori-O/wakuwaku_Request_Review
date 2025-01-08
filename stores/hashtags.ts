import { defineStore } from 'pinia'
import { createClient } from '@supabase/supabase-js'

interface Hashtag {
  id: string
  text: string
  created_at: string
  admin_id: string
}

interface UserCase {
  id: string
  basic_info: any
  disability_status: any
  considerations: any
  selected_hashtags: string[]
  episode: string | null
  created_at: string
  updated_at: string
}

// Supabaseクライアントの初期化
async function getSupabaseClient() {
  const config = useRuntimeConfig()
  const supabase = createClient(
    config.public.supabaseUrl as string,
    config.public.supabaseKey as string
  )

  // 現在のセッションを取得
  const { data: { session } } = await supabase.auth.getSession()
  
  // セッションがある場合は認証トークンを設定
  if (session) {
    return createClient(
      config.public.supabaseUrl as string,
      config.public.supabaseKey as string,
      {
        global: {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        }
      }
    )
  }

  return supabase
}

export const useHashtagStore = defineStore('hashtags', {
  state: () => ({
    hashtags: [] as Hashtag[],
    selectedHashtags: [] as string[],
    currentCaseId: null as string | null,
    currentAdminId: null as string | null
  }),

  actions: {
    async fetchHashtags() {
      try {
        const supabase = await getSupabaseClient()
        console.log('Fetching hashtags...')

        const { data, error } = await supabase
          .from('hashtags')
          .select('*, admin_users(email)')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching hashtags:', error)
          throw error
        }

        console.log('Fetched hashtags:', data)
        this.hashtags = data || []
      } catch (error) {
        console.error('Error in fetchHashtags:', error)
        throw error
      }
    },

    async getCurrentAdmin() {
      try {
        const supabase = await getSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return null

        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select()
          .eq('email', user.email)
          .single()

        if (adminError) throw adminError
        
        this.currentAdminId = adminData.id
        return adminData
      } catch (error) {
        console.error('Error getting current admin:', error)
        return null
      }
    },

    async loadUserCaseHashtags(caseId: string) {
      try {
        const supabase = await getSupabaseClient()
        const { data, error } = await supabase
          .from('user_cases')
          .select('selected_hashtags')
          .eq('id', caseId)
          .single()

        if (error) {
          console.error('Error loading user case hashtags:', error)
          throw error
        }

        if (data) {
          this.selectedHashtags = data.selected_hashtags || []
          this.currentCaseId = caseId
        }
      } catch (error) {
        console.error('Error in loadUserCaseHashtags:', error)
        throw error
      }
    },

    async updateUserCaseHashtags() {
      if (!this.currentCaseId) {
        console.error('No case ID set')
        return
      }

      try {
        const supabase = await getSupabaseClient()
        const { error } = await supabase
          .from('user_cases')
          .update({
            selected_hashtags: this.selectedHashtags,
            updated_at: new Date().toISOString()
          })
          .eq('id', this.currentCaseId)

        if (error) {
          console.error('Error updating user case hashtags:', error)
          throw error
        }
      } catch (error) {
        console.error('Error in updateUserCaseHashtags:', error)
        throw error
      }
    },

    async addHashtag(text: string) {
      try {
        if (!this.currentAdminId) {
          await this.getCurrentAdmin()
        }

        if (!this.currentAdminId) {
          throw new Error('管理者認証が必要です')
        }

        const supabase = await getSupabaseClient()
        const newHashtag: Partial<Hashtag> = {
          text,
          admin_id: this.currentAdminId
        }

        console.log('Attempting to add hashtag:', newHashtag)

        const { data, error } = await supabase
          .from('hashtags')
          .insert([newHashtag])
          .select()

        if (error) {
          console.error('Error adding hashtag:', error)
          throw error
        }

        console.log('Hashtag added successfully:', data)
        if (data && data[0]) {
          this.hashtags.unshift(data[0])
        }
      } catch (error) {
        console.error('Error in addHashtag:', error)
        throw error
      }
    },

    async removeHashtag(id: string) {
      try {
        const supabase = await getSupabaseClient()
        const { error } = await supabase
          .from('hashtags')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error removing hashtag:', error)
          throw error
        }

        this.hashtags = this.hashtags.filter(tag => tag.id !== id)
        this.selectedHashtags = this.selectedHashtags.filter(tagId => tagId !== id)
      } catch (error) {
        console.error('Error in removeHashtag:', error)
        throw error
      }
    },

    async updateHashtag(id: string, text: string) {
      try {
        const supabase = await getSupabaseClient()
        const { error } = await supabase
          .from('hashtags')
          .update({ text })
          .eq('id', id)

        if (error) {
          console.error('Error updating hashtag:', error)
          throw error
        }

        const hashtag = this.hashtags.find(tag => tag.id === id)
        if (hashtag) {
          hashtag.text = text
        }
      } catch (error) {
        console.error('Error in updateHashtag:', error)
        throw error
      }
    },

    toggleHashtagSelection(id: string) {
      const index = this.selectedHashtags.indexOf(id)
      if (index === -1) {
        this.selectedHashtags.push(id)
      } else {
        this.selectedHashtags.splice(index, 1)
      }
      
      // 選択状態が変更されたら自動的にuser_casesを更新
      if (this.currentCaseId) {
        this.updateUserCaseHashtags()
      }
    }
  }
})