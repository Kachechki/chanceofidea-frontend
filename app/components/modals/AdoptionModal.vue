<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
  >
    <div
      ref="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adoption-title"
      tabindex="-1"
      class="w-full max-w-lg rounded-xl bg-card text-card-foreground p-6 shadow-xl border border-border focus:outline-none"
      @keydown.esc="$emit('close')"
    >
      <div class="flex items-center justify-between pb-4 border-b border-border">
        <h2 id="adoption-title" class="text-xl font-bold">Submit Adoption Request</h2>
        <button
          type="button"
          @click="$emit('close')"
          class="text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="mt-4 space-y-4">
        <div>
          <label for="adoption-why" class="block text-sm font-medium mb-1">Why you?</label>
          <textarea
            id="adoption-why"
            v-model="form.whyMe"
            rows="3"
            required
            placeholder="Tell us why this project should go to you..."
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          ></textarea>
        </div>

        <div>
          <label for="adoption-plan" class="block text-sm font-medium mb-1">Your Action Plan (2-4 weeks horizon)</label>
          <textarea
            id="adoption-plan"
            v-model="form.actionPlan"
            rows="3"
            required
            placeholder="Describe your first steps after getting the project..."
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          ></textarea>
        </div>

        <div>
          <label for="adoption-portfolio" class="block text-sm font-medium mb-1">GitHub / LinkedIn / Portfolio URL</label>
          <input
            id="adoption-portfolio"
            type="url"
            v-model="form.portfolioUrl"
            required
            placeholder="https://github.com/username"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id="terms"
            v-model="form.acceptTerms"
            required
            class="rounded border-input text-primary focus:ring-ring"
          />
          <label for="terms" class="text-sm text-muted-foreground">
            I agree with the project transfer terms set by the author
          </label>
        </div>

        <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>

        <div class="flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:opacity-80"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            :aria-busy="isLoading"
            class="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {{ isLoading ? 'Sending...' : 'Submit Request' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { nextTick, reactive, ref, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'submit'])

const dialog = ref(null)

const form = reactive({
  whyMe: '',
  actionPlan: '',
  portfolioUrl: '',
  acceptTerms: false
})

// Start from a clean form each time the modal opens, and move focus into it
watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return
    form.whyMe = ''
    form.actionPlan = ''
    form.portfolioUrl = ''
    form.acceptTerms = false
    await nextTick()
    dialog.value?.focus()
  }
)

const handleSubmit = () => {
  emit('submit', { ...form })
}
</script>
