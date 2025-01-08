<template>
  <v-btn
    variant="outlined"
    color="primary"
    class="pdf-download-btn"
    type="button"
    :loading="generating"
    :disabled="generating"
    @click.prevent.stop="handleClick"
  >
    PDF出力
  </v-btn>
</template>

<script setup lang="ts">
const props = defineProps<{
  caseId: string
}>()

const generating = ref(false)
const emit = defineEmits<{
  (e: 'success'): void
  (e: 'error', message: string): void
}>()

const handleClick = async (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  
  generating.value = true
  try {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        case_id: props.caseId
      })
    })

    if (!response.ok) {
      throw new Error('PDFの生成に失敗しました')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    window.open(url, '_blank')
    
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 1000)

    emit('success')
  } catch (error) {
    console.error('Error generating PDF:', error)
    emit('error', error instanceof Error ? error.message : 'PDFの出力に失敗しました')
  } finally {
    generating.value = false
  }
}
</script> 