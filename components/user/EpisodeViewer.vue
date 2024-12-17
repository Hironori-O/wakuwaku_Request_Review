<template>
  <v-card>
    <v-card-text>
      <v-textarea
        v-model="editedEpisode"
        label="エピソード内容"
        rows="15"
        height="400"
        hide-details
        class="episode-textarea"
        :readonly="!isEditing"
      />
      <v-btn
        color="primary"
        class="mt-4"
        @click="toggleEdit"
      >
        {{ isEditing ? '保存' : '編集' }}
      </v-btn>
    </v-card-text>
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
    >
      エピソードを更新しました
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  episode: string
}>()

const emit = defineEmits<{
  (e: 'update:episode', value: string): void
}>()

const editedEpisode = ref(props.episode)
const isEditing = ref(false)
const showSuccess = ref(false)

watch(() => props.episode, (newValue) => {
  editedEpisode.value = newValue
})

const toggleEdit = () => {
  if (isEditing.value) {
    // 保存処理
    emit('update:episode', editedEpisode.value)
    showSuccess.value = true
  }
  isEditing.value = !isEditing.value
}
</script>

<style scoped>
.episode-textarea :deep(.v-field__input) {
  min-height: 400px !important;
  overflow-y: auto;
}
</style> 