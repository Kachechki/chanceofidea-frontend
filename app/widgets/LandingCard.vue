<script setup lang="ts">
import type { Component } from 'vue'
import { Card, CardContent } from '@/components/ui/card'

const props = defineProps<{
  count: number
  description: string
  icon: Component
}>()

const DURATION = 1500 // ms
const displayed = ref(0)
let frame = 0

onMounted(() => {
  const start = performance.now()

  const tick = (now: number) => {
    const progress = Math.min((now - start) / DURATION, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    displayed.value = Math.round(props.count * eased)

    if (progress < 1) frame = requestAnimationFrame(tick)
  }

  frame = requestAnimationFrame(tick)
})

onBeforeUnmount(() => cancelAnimationFrame(frame))

const formatted = computed(() => displayed.value.toLocaleString('en-US'))
</script>

<template>
  <Card class="rounded-2xl shadow-none">
    <CardContent class="flex items-center gap-5 p-8">
      <div
          class="flex size-20 shrink-0 items-center justify-center rounded-full bg-[--color-chart-1]"
      >
        <component :is="icon" class="size-6" />
      </div>

      <div>
        <p class="text-3xl font-bold leading-tight tabular-nums">{{ formatted }}</p>
        <p class="text-muted-foreground">{{ description }}</p>
      </div>
    </CardContent>
  </Card>
</template>