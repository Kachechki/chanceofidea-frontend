<script setup lang="ts">
import Header from '~/widgets/Header.vue'
import Footer from '~/widgets/Footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background text-foreground">
    <Header />
    <main class="flex-1">
      <slot />
    </main>
    <Footer />
  </div>
</template>

	<style scoped lang="css"></style>