<!-- src/App.vue -->

<template>
  <div v-if="show_screen == true">
    <!-- Show router-switched views -->
    <router-view />
  </div>
  <div v-else></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const show_screen = ref(false)

onMounted(async () => {
  show_screen.value = true
})
</script>

<style scoped></style>
