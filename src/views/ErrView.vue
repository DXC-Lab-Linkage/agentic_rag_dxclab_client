<!-- src/views/ErrView.vue -->

<template>
  <v-container>
    <v-app class="app-class">
      <v-main>
        <v-container>
          <h3 align="center" justify="center">
            <span
              >We apologize for the inconvenience, but an error occurred. Please try again
              later.</span
            >
          </h3>
        </v-container>
      </v-main>
    </v-app>
  </v-container>
</template>

<script setup lang="ts"></script>

<style scoped>
.app-class {
  margin-top: 30vh; /* Add space above */
  background-color: transparent;
  color: white;
}
</style>
