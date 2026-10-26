<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
  >
    <div
      ref="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-title"
      aria-describedby="reject-description"
      tabindex="-1"
      class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-card text-card-foreground p-5 md:p-6 shadow-xl border border-border focus:outline-none"
      @keydown.esc="emit('close')"
    >
      <div class="flex items-center justify-between pb-4 border-b border-border">
        <h2 id="reject-title" class="text-xl font-bold">Reject application</h2>
        <button
          type="button"
          class="text-muted-foreground hover:text-foreground"
          aria-label="Close"
          @click="emit('close')"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <p id="reject-description" class="mt-4 text-sm text-muted-foreground">
        Tell @{{ applicantLogin }} why you are declining their request for
        <span class="font-medium text-foreground">{{ projectTitle }}</span>.
        The reason is shown to them. The project stays open for other applicants.
      </p>

      <form novalidate class="mt-4 flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-1.5">
          <label for="reject-reason" class="text-sm font-medium">Reason</label>
          <textarea
            id="reject-reason"
            ref="input"
            v-model="reason"
            rows="4"
            :maxlength="LIMITS.rejectReason"
            placeholder="For example: I need someone with more experience in this stack."
            :aria-invalid="!!reasonError"
            :aria-describedby="reasonError ? 'reject-reason-error' : undefined"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <FieldError id="reject-reason-error" :message="reasonError" />
        </div>

        <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>

        <div class="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:opacity-80"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            :aria-busy="isLoading"
            class="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {{ isLoading ? 'Rejecting...' : 'Reject application' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import FieldError from '~/components/FieldError.vue'
import { LIMITS, validateText } from '~/lib/validation'

const props = defineProps<{
  isOpen: boolean
  applicantLogin: string
  projectTitle: string
  isLoading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  close: []
  confirm: [reason: string]
}>()

const dialog = ref<HTMLElement | null>(null)
const input = ref<HTMLTextAreaElement | null>(null)
const reason = ref('')
const attempted = ref(false)

// the same rule as the store: required, within the shared length limit
const reasonError = computed(() =>
  attempted.value
    ? validateText(reason.value, 'Reason', LIMITS.rejectReason, 'Add a short reason so the applicant knows why')
    : ''
)

// start empty each time the dialog opens, then focus the reason field
watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return
    reason.value = ''
    attempted.value = false
    await nextTick()
    input.value?.focus()
  }
)

const handleSubmit = () => {
  attempted.value = true
  if (reasonError.value || props.isLoading) return
  emit('confirm', reason.value.trim())
}
</script>
