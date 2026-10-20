<script setup lang="ts">
import Header from '~/widgets/Header.vue'
import Footer from '~/widgets/Footer.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background text-foreground">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <Header />
    <main id="main-content" tabindex="-1" class="flex-1 focus:outline-none">
      <slot />
    </main>
    <Footer />
  </div>
</template>
