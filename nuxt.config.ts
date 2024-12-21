// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  css: ['vuetify/styles', '@mdi/font/css/materialdesignicons.css'],
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],
  plugins: [
    '~/plugins/supabase.ts'
  ],
  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    },
    openaiApiKey: process.env.OPENAI_API_KEY,
    gmailUser: process.env.GMAIL_USER,
    gmailClientId: process.env.GMAIL_CLIENT_ID,
    gmailClientSecret: process.env.GMAIL_CLIENT_SECRET,
    gmailRefreshToken: process.env.GMAIL_REFRESH_TOKEN
  },
  build: {
    transpile: ['vuetify']
  },
  app: {
    head: {
      title: '業務支援システム',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  imports: {
    dirs: ['composables/**']
  },
  nitro: {
    routeRules: {
      // ルートルールの設定
    }
  },
  experimental: {
    // 実験的な機能の設定
    payloadExtraction: false
  }
})