<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
  >
    <div
      ref="dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="transfer-action-title"
      aria-describedby="transfer-action-steps"
      tabindex="-1"
      :class="[
        'w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-card text-card-foreground p-5 md:p-6 shadow-xl focus:outline-none',
        isDecline ? 'border-2 border-destructive' : 'border border-border',
      ]"
      @keydown.esc="emit('close')"
    >
      <div class="flex items-start justify-between gap-4 pb-4 border-b border-border">
        <h2
          id="transfer-action-title"
          :class="['text-xl font-bold', isDecline ? 'text-destructive' : 'text-foreground']"
        >
          {{ isDecline ? 'Decline this transfer' : 'Confirm you received the repository' }}
        </h2>
        <button
          type="button"
          class="text-muted-foreground hover:text-foreground"
          aria-label="Close"
          @click="emit('close')"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <p class="mt-4 text-sm font-medium text-foreground">What happens next</p>
      <ol id="transfer-action-steps" class="mt-2 list-decimal pl-5 flex flex-col gap-2 text-sm text-muted-foreground">
        <li v-for="step in steps" :key="step">{{ step }}</li>
      </ol>

      <form novalidate class="mt-5 flex flex-col gap-4" @submit.prevent="handleSubmit">
        <label
          v-if="!isDecline"
          class="flex items-start gap-2 text-sm text-foreground"
        >
          <input
            v-model="accepted"
            type="checkbox"
            class="mt-0.5 rounded border-input text-primary focus:ring-ring"
          />
          <span>I accepted the transfer on GitHub, and this repository is now under my account.</span>
        </label>

        <div
          v-else
          class="flex flex-col gap-1.5"
        >
          <label
            for="transfer-action-input"
            class="text-sm font-medium"
          >
            To confirm, type the repository name <span class="font-mono">{{ repoName }}</span> below
          </label>
          <input
            id="transfer-action-input"
            ref="input"
            v-model="typed"
            type="text"
            autocomplete="off"
            spellcheck="false"
            :aria-invalid="typed.length > 0 && !matches"
            class="w-full px-3 py-2 text-sm font-mono bg-background border-2 border-destructive/50 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
          />
        </div>

        <p
          v-if="error"
          role="alert"
          class="text-sm text-destructive"
        >
          {{ error }}
        </p>

        <div class="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:opacity-80"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            v-if="isDecline"
            type="submit"
            :disabled="!matches || isLoading"
            :aria-busy="isLoading"
            class="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Declining...' : 'I do not want it' }}
          </button>
          <button
            v-else
            type="submit"
            :disabled="!accepted || isLoading"
            :aria-busy="isLoading"
            class="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Confirming...' : 'I have received it' }}
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
  mode: 'confirm' | 'decline'
  ownerLogin: string
  repoName: string
  isLoading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const dialog = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)
const accepted = ref(false)
const typed = ref('')

const isDecline = computed(() => props.mode === 'decline')

// the steps differ by action, but both live in this one dialog
const steps = computed(() =>
  isDecline.value
    ? [
        `The repository stays with @${props.ownerLogin}.`,
        'The project goes back to open for applications.',
        'Your request is marked as declined. This cannot be undone from here.',
      ]
    : [
        'Open your GitHub notifications and accept the transfer request for this repository.',
        'Check that the repository now appears under your account on GitHub.',
        'Confirm here. This records the handover and marks the project as adopted.',
      ]
)

// exact match against the repository name, same as the other typed confirmations
const matches = computed(() => !!props.repoName && typed.value.trim() === props.repoName)

// start clean each time the dialog opens, then focus the first field
watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return
    accepted.value = false
    typed.value = ''
    await nextTick()
    if (isDecline.value) input.value?.focus()
    else dialog.value?.focus()
  }
)

const handleSubmit = () => {
  if (props.isLoading) return
  if (isDecline.value && !matches.value) return
  if (!isDecline.value && !accepted.value) return
  emit('confirm')
}
</script>
