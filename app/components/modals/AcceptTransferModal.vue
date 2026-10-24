<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
  >
    <div
      ref="dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="accept-transfer-title"
      aria-describedby="accept-transfer-warning"
      tabindex="-1"
      class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-card text-card-foreground p-5 md:p-6 shadow-xl border-2 border-destructive focus:outline-none"
      @keydown.esc="emit('close')"
    >
      <div class="flex items-start justify-between gap-4 pb-4 border-b border-destructive/30">
        <h2 id="accept-transfer-title" class="text-xl font-bold text-destructive">
          Accept and transfer repository
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

      <div id="accept-transfer-warning" class="mt-4 flex flex-col gap-3 text-sm">
        <p class="font-semibold text-destructive">This action cannot be undone.</p>
        <ul class="list-disc pl-5 flex flex-col gap-2 text-foreground">
          <li>
            <strong>{{ repoName }}</strong> will be transferred to
            <strong>@{{ applicantLogin }}</strong> on GitHub.
          </li>
          <li>
            GitHub sends them a transfer request. Until they accept it on GitHub, the transfer stays pending.
          </li>
          <li>
            Once they accept, you lose ownership of the repository and its settings, and you can no longer
            push, merge, or delete it from your account.
          </li>
          <li>
            A <code class="font-mono">TRANSFER.md</code> record is committed to the repository after the
            transfer completes.
          </li>
        </ul>
      </div>

      <form novalidate class="mt-5 flex flex-col gap-4" @submit.prevent="handleConfirm">
        <div class="flex flex-col gap-1.5">
          <label for="accept-transfer-input" class="text-sm font-medium">
            To confirm, type the repository name <span class="font-mono">{{ repoName }}</span> below
          </label>
          <input
            id="accept-transfer-input"
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
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!matches || isLoading"
            :aria-busy="isLoading"
            class="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Transferring...' : 'Accept and transfer' }}
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
  repoName: string
  applicantLogin: string
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

// exact, case-sensitive match, the same way github asks for repo names
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
