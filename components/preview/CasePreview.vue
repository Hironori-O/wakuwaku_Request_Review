<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <v-card class="preview-dialog">
      <v-toolbar
        color="primary"
      >
        <v-btn
          icon
          @click="handleClose"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>プレビュー</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn
            variant="text"
            :loading="generating"
            :disabled="generating"
            @click.prevent.stop="handleGeneratePdf"
          >
            PDF出力
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <div class="preview-wrapper">
        <div class="preview-container">
          <div class="preview-content" contenteditable="true" @input="handleContentEdit">
            <div class="title" contenteditable="false">就労状況に関する第三者からの申立書</div>

            <div class="content">
              私（申立者）は、<span class="editable">{{ previewData.basic_info.company_name }}</span>
              <span class="editable">{{ previewData.basic_info.department }}</span>の
              <span class="editable">{{ previewData.basic_info.position }}</span>を務めており、請求人である
              <span class="editable">{{ previewData.basic_info.person_name }}</span>さんの直属の上司にあたります。
              障害年金の請求人<span class="editable">{{ previewData.basic_info.person_name }}</span>さんの就労状況
              について熟知していますので、以下申し立てます。
            </div>

            <div class="work-details underline" contenteditable="false">
              請求人の雇用状況　
            </div>

            <div class="employment-info">
              <div class="employment-item">
                入社日：<span class="editable"> {{ getHireDate.year }}</span>年
                <span class="editable"> {{ getHireDate.month }}</span>月
                <span class="editable"> {{ getHireDate.day }}</span>日
              </div>
              <div class="employment-item">
                仕事の頻度：1日<span class="editable">{{ previewData.basic_info.daily_work_hours }}</span>時間、
                週に<span class="editable">{{ previewData.basic_info.weekly_work_days }}</span>日勤務
              </div>
              <div class="employment-item">
                仕事の内容（具体的な業務内容）：<br>
              </div>
              <span class="editable">入社当初は〇〇などの業務を担当していましたが、令和〇年〇月より簡単なPC操作やゴミ捨てなど体力的、精神的負荷のかからない業務を担当させております。</span>
            </div>

            <div class="work-details underline" contenteditable="false">
              職場での様子・配慮や支援の状況・障害に関する具体的なエピソード等　
            </div>

            <div class="episode editable" contenteditable="true" @input="handleEpisodeEdit">
              {{ previewData.episode }}
              <br><br>
              <span class="editable">
                その他、勤怠（遅刻、早退、欠勤）や業務内容（量・質・納期）には特別な配慮をしており、雇用体系は一般雇用ですが、実質上は障害者雇用と同等のサポートをしております。
              </span>
            </div>
            <div class="set-right">以上</div>

            <div class="signature">
              <div class="date">
                令和 <span class="editable"> {{ getCurrentDate.year }}</span>年
                <span class="editable"> {{ getCurrentDate.month }}</span>月
                <span class="editable"> {{ getCurrentDate.day }}</span>日
              </div>
              <div class="sign-item" data-label="事業所名：">
                <span class="editable"> {{ previewData.basic_info.company_name }}</span>
              </div>
              <div class="sign-item" data-label="事業所所在地：">
                <span class="editable"> {{ previewData.basic_info.address }}</span>
              </div>
              <div class="sign-item" data-label="申立者氏名：">
                <span class="editable"> {{ previewData.basic_info.writer_name }}　　　　㊞</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { CaseData } from '~/types/case'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

const props = defineProps<{
  modelValue: boolean
  caseData: CaseData
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
  (e: 'error', message: string): void
}>()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const generating = ref(false)

// プレビューデータの初期化（編集可能なコピーを作成）
const previewData = ref<CaseData>(JSON.parse(JSON.stringify(props.caseData)))

// 入社日のパース
const getHireDate = computed(() => {
  const date = new Date(previewData.value.basic_info.hire_date)
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  }
})

// 現在の日付
const getCurrentDate = computed(() => {
  const now = new Date()
  return {
    year: now.getFullYear() - 2018, // 令和への変換
    month: now.getMonth() + 1,
    day: now.getDate()
  }
})

// ダイアログを閉じる
const handleClose = () => {
  dialog.value = false
}

// PDF生成処理
const handleGeneratePdf = async (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  
  generating.value = true
  try {
    // プレビューコンテンツの要素を取得
    const element = document.querySelector('.preview-container') as HTMLElement
    if (!element) throw new Error('プレビュー要素が見つかりません')

    // html2canvasでプレビューをキャプチャ
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    // キャンバスからPDFを生成
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    })

    // キャンバスの寸法を取得
    const imgWidth = 210 // A4の幅
    const pageHeight = 297 // A4の高さ
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // 最初のページを追加
    if (imgHeight <= pageHeight) {
      // 1ページに収まる場合
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      )
    } else {
      // 複数ページになる場合
      let heightLeft = imgHeight
      let position = 0
      let page = 0

      while (heightLeft > 0) {
        // 現在のページにコンテンツを追加
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          page === 0 ? 0 : -position,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        )

        heightLeft -= pageHeight
        position += pageHeight
        page++

        // まだコンテンツが残っている場合は新しいページを追加
        if (heightLeft > 0) {
          pdf.addPage()
        }
      }
    }

    // PDFを保存
    pdf.save(`就労状況申立書_${new Date().toISOString().split('T')[0]}.pdf`)

    emit('success')
    handleClose()
  } catch (error) {
    console.error('Error generating PDF:', error)
    emit('error', error instanceof Error ? error.message : 'PDFの出力に失敗しました')
  } finally {
    generating.value = false
  }
}

// コンテンツの集ハンドラー
const handleContentEdit = (e: Event) => {
  const target = e.target as HTMLElement
  // 必要に応じてpreviewDataを更新
}

// エピソードの編集ハンドラー
const handleEpisodeEdit = (e: Event) => {
  const target = e.target as HTMLElement
  previewData.value.episode = target.innerText
}
</script>

<style scoped>
.preview-dialog {
  background-color: #f5f5f5;
}

.preview-wrapper {
  padding: 2rem;
  min-height: calc(100vh - 64px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
}

.preview-container {
  width: 210mm;
  min-height: 297mm;
  padding: 20mm;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  box-sizing: border-box;
}

.preview-content {
  font-family: 'MS Mincho', 'ＭＳ 明朝', serif;
  line-height: 1.8;
  font-size: 11pt;
  height: 100%;
  outline: none;
  box-sizing: border-box;
  padding-left: 5mm;
}

.title {
  text-align: center;
  font-size: 14pt;
  font-weight: bold;
  margin-bottom: 10mm;
  user-select: none;
}

.content {
  text-indent: 1em;
  /* margin-bottom: 10mm; */
  line-height: 1.8;
}

/* .employment-info {
  margin: 10mm 0;
} */

.employment-item {
  margin: 4mm 0;
  display: flex;
  align-items: baseline;
  padding-left: 2em;
  position: relative;
}

.employment-item::before {
  content: "□";
  position: absolute;
  left: 0;
}

.work-details {
  margin: 6mm 0 4mm;
  font-weight: bold;
}

.episode {
  margin: 6mm 0;
  min-height: 70mm;
  white-space: pre-wrap;
  line-height: 1.8;
}

.signature {
  margin-top: 10mm;
  display: flex;
  flex-direction: column;
}

.set-right {
  text-align: right;
  /* padding-right: 10mm; */
}

.date {
  margin-bottom: 2mm;
  /* text-align: right; */
  /* padding-right: 30mm; */
}

.sign-item {
  margin: 2mm 0;
  display: flex;
  align-items: baseline;
  justify-content: flex-start;
  /* padding-left: 65mm; */
}

.sign-item::before {
  content: attr(data-label);
  white-space: nowrap;
  margin-right: 4mm;
}

.underline {
  border-bottom: 1px solid black;
  padding-bottom: 0.5mm;
  /* width: 95mm; */
  display: inline-block;
  text-align: left;
  padding-left: 3mm;
}

.editable {
  position: relative;
  min-width: 1em;
  display: inline-block;
}

.editable:hover {
  background-color: rgba(0, 0, 0, 0.05);
  cursor: text;
}

.editable:focus {
  outline: none;
  background-color: rgba(0, 0, 0, 0.05);
}
</style> 