<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="text-center pa-6">
          <v-icon
            size="64"
            color="error"
            class="mb-4"
          >
            mdi-alert-circle
          </v-icon>
          <h1 class="text-h4 mb-4">アクセスできません</h1>
          <p class="text-body-1 mb-6">
            {{ error?.message || 'このリンクは現在利用できない状態です。' }}
          </p>
          <p class="text-body-2 text-grey mb-6">
            リンクが無効化されているか、期限切れの可能性があります。<br>
            ご不明な点がございましたら、管理者にお問い合わせください。
          </p>
          <v-btn
            color="primary"
            to="/"
            variant="elevated"
          >
            トップページに戻る
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const error = useError()
</script>

<style scoped>
.v-container {
  background-color: #f5f5f5;
}
</style> 