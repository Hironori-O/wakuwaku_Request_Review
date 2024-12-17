import { defineStore } from 'pinia'
import { generateEpisode } from '~/utils/episodeGenerator'

interface BasicInfo {
  person_name: string
  company_name: string
  address: string
  phone: string
  position: string
  writer_name: string
  relationship: string
  work_type: string
  work_hours: string
  [key: string]: string
}

interface DisabilityStatus {
  lateness: string
  early_leaving: string
  sudden_absence: string
  leaving_during_work: string
  communication: string
  work_capability: string[]
  work_performance: string[]
}

interface Considerations {
  physical_environment: string[]
  work_considerations: string[]
  communication_support: string[]
  human_support: string[]
  health_safety: string[]
  career_development: string[]
  mental_support: string[]
}

export const useUserFormStore = defineStore('userForm', {
  state: () => ({
    basic_info: {
      person_name: '',
      company_name: '',
      address: '',
      phone: '',
      position: '',
      writer_name: '',
      relationship: '',
      work_type: '',
      work_hours: ''
    } as BasicInfo,
    disability_status: {
      lateness: '',
      early_leaving: '',
      sudden_absence: '',
      leaving_during_work: '',
      communication: '',
      work_capability: [],
      work_performance: []
    } as DisabilityStatus,
    considerations: {
      physical_environment: [],
      work_considerations: [],
      communication_support: [],
      human_support: [],
      health_safety: [],
      career_development: [],
      mental_support: []
    } as Considerations,
    episode: ''
  }),

  actions: {
    // 値空でないかチェックする関数
    isNotEmpty(value: any): boolean {
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== '' && value !== null && value !== undefined
    },

    validateBasicInfo(isDraft: boolean = false) {
      // 一時保存の場合は、いずれかのフィールドに入力があればOK
      if (isDraft) {
        // 各セクションの入力チェック
        const hasInput = (obj: any): boolean => {
          return Object.entries(obj).some(([_, value]) => {
            if (Array.isArray(value)) {
              return value.length > 0
            }
            return value !== '' && value !== null && value !== undefined
          })
        }

        return hasInput(this.basic_info) ||
               hasInput(this.disability_status) ||
               hasInput(this.considerations) ||
               this.episode !== ''
      }

      // 完了保存の場合は必須項目のチェック
      const requiredFields = [
        'person_name',
        'company_name',
        'address',
        'phone',
        'position',
        'writer_name',
        'relationship',
        'work_type',
        'work_hours'
      ] as const

      return requiredFields.every(field => this.basic_info[field] !== '')
    },

    async generateEpisode() {
      try {
        const response = await $fetch<{
          success: boolean;
          data?: { episode: string };
          error?: string;
        }>('/api/generate-episode', {
          method: 'POST',
          body: {
            case_data: {
              form_data: {
                basic_info: this.basic_info,
                disability_status: this.disability_status,
                considerations: this.considerations
              }
            }
          }
        })

        if (response.success && response.data) {
          this.episode = response.data.episode
        } else {
          throw new Error(response.error || 'エピソードの生成に失敗しました')
        }
      } catch (error) {
        console.error('Error generating episode:', error)
        throw new Error('エピソードの生成に失敗しました')
      }
    },

    resetForm() {
      // 初期状態にリセット
      this.$patch({
        basic_info: {
          person_name: '',
          company_name: '',
          address: '',
          phone: '',
          position: '',
          writer_name: '',
          relationship: '',
          work_type: '',
          work_hours: ''
        },
        disability_status: {
          lateness: '',
          early_leaving: '',
          sudden_absence: '',
          leaving_during_work: '',
          communication: '',
          work_capability: [],
          work_performance: []
        },
        considerations: {
          physical_environment: [],
          work_considerations: [],
          communication_support: [],
          human_support: [],
          health_safety: [],
          career_development: [],
          mental_support: []
        },
        episode: ''
      })
    }
  }
})