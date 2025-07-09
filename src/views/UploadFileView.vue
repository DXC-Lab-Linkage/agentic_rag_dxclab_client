<template>
  <v-card>
    <v-card-title>Upload file</v-card-title>
    <v-card-text>
      <v-file-input
        v-model="file"
        label="Select file"
        accept=".txt,.md,.pdf"
        show-size
        @change="onFileChange"
      ></v-file-input>
      <v-btn :disabled="!file" @click="uploadFile" color="primary">Upload</v-btn>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const file = ref<File | null>(null)

function onFileChange(newFile: File | null) {
  file.value = newFile
}

async function uploadFile() {
  if (!file.value) return
  const formData = new FormData()
  formData.append('file', file.value)
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })

  if (res.ok) {
    const data = await res.json()
    // data.text で抽出されたテキストが返る想定
    alert('テキスト:\n' + data.text)
  } else {
    alert('アップロード失敗')
  }
}
</script>
