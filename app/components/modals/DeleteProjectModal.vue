<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
  >
    <div
      ref="dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-project-title"
      aria-describedby="delete-project-warning"
      tabindex="-1"
      class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-card text-card-foreground p-5 md:p-6 shadow-xl border-2 border-destructive focus:outline-none"
      @keydown.esc="emit('close')"
    >
      <div class="flex items-start justify-between gap-4 pb-4 border-b border-destructive/30">
        <h2 id="delete-project-title" class="text-xl font-bold text-destructive">
          {{ isPublished ? $t('modals.delete.publishedTitle') : $t('modals.delete.draftTitle') }}
        </h2>
        <button
          type="button"
          class="text-muted-foreground hover:text-foreground"
          :aria-label="$t('common.close')"
          @click="emit('close')"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <div id="delete-project-warning" class="mt-4 flex flex-col gap-3 text-sm">
        <p class="font-semibold text-destructive">{{ $t('modals.delete.cannotUndo') }}</p>
        <ul class="list-disc pl-5 flex flex-col gap-2 text-foreground">
          <li>{{ $t('modals.delete.line1', { title: projectTitle }) }}</li>
          <li v-if="isPublished">{{ $t('modals.delete.line2') }}</li>
          <li v-if="isPublished">
            <template v-if="applicationCount === null">{{ $t('modals.delete.appsUnknown') }}</template>
            <template v-else-if="applicationCount === 0">{{ $t('modals.delete.appsNone') }}</template>
            <template v-else-if="applicationCount === 1">{{ $t('modals.delete.appsOne', { count: applicationCount }) }}</template>
            <template v-else>{{ $t('modals.delete.appsMany', { count: applicationCount }) }}</template>
          </li>
          <li>{{ $t('modals.delete.repo', { repo: repoName }) }}</li>
        </ul>
      </div>

      <form novalidate class="mt-5 flex flex-col gap-4" @submit.prevent="handleConfirm">
        <div class="flex flex-col gap-1.5">
          <label for="delete-project-input" class="text-sm font-medium">
            {{ $t('modals.delete.confirmLabel', { repo: repoName }) }}
          </label>
          <input
            id="delete-project-input"
            ref="input"
            v-model="typed"
            type="text"
            autocomplete="off"
            spellcheck="false"
            :aria-invalid="typed.length > 0 && !matches"
            class="w-full px-3 py-2 text-sm font-mono bg-background border-2 border-destructive/50 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
          />
        </div>

        <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>

        <div class="flex justify-end gap-3 pt-4 border-t border-destructive/30">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:opacity-80"
            @click="emit('close')"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="!matches || isLoading"
            :aria-busy="isLoading"
            class="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? $t('modals.delete.deleting') : $t('modals.delete.confirm') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  projectTitle: string
  repoName: string
  isPublished: boolean
  // null means the count could not be loaded
  applicationCount: number | null
  isLoading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const dialog = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const typed = ref('')

// exact match against the repository name, same as the accept dialog
const matches = computed(() => !!props.repoName && typed.value.trim() === props.repoName)

// start empty each time the dialog opens, then focus the input
watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return
    typed.value = ''
    await nextTick()
    input.value?.focus()
  }
)

const handleConfirm = () => {
  if (!matches.value || props.isLoading) return
  emit('confirm')
}
</script>
