<!-- src/views/SrvErrView.vue -->

<template>
  <v-container>
    <v-app class="app-class">
      <v-main>
        <v-container>
          <h3 align="center">
            <span
              >The service is currently unavailable because we are unable to connect to the
              server.</span
            >
            <br />
            <span>Please try again later. We apologize for the inconvenience.</span>
          </h3>
        </v-container>
      </v-main>
    </v-app>
  </v-container>
</template>

<script setup lang="ts"></script>

<style scoped>
.app-class {
  margin-top: 30vh;
  background-color: transparent;
  color: white;
}
</style>
