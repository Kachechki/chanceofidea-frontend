<script setup lang="ts">
import {Button} from "~/widgets/ui/button";
import { Lightbulb } from '@lucide/vue';
</script>

<template>
  <header class="flex items-center justify-between gap-6 px-8 py-4 bg-background border-b border-border">
    <div class="flex items-center gap-3 min-w-0">
      <Lightbulb class="w-[22px] h-[22px] text-primary shrink-0" stroke-width="1.5" />
      <h1 class="text-lg font-bold text-foreground whitespace-nowrap m-0">Second Chance Archive</h1>
      <span class="text-sm text-muted-foreground whitespace-nowrap pl-2 border-l border-border">Project Catalog</span>
    </div>
    <div class="flex items-center gap-3 shrink-0">
      <Button class="bg-primary text-primary-foreground hover:bg-primary/90">Publish Project</Button>
      <Button variant="outline" class="border-input text-foreground hover:bg-accent hover:text-accent-foreground">Log in</Button>
      <!--    <Avatar /> -->
    </div>
  </header>
</template>