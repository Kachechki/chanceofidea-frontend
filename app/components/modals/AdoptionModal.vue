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
      class="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-card text-card-foreground p-5 md:p-6 shadow-xl border border-border focus:outline-none"
      @keydown.esc="emit('close')"
    >
      <div class="flex items-center justify-between pb-4 border-b border-border">
        <h2 id="adoption-title" class="text-xl font-bold">{{ $t('modals.adoption.title') }}</h2>
        <button
          type="button"
          @click="emit('close')"
          class="text-muted-foreground hover:text-foreground"
          :aria-label="$t('common.close')"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      <form novalidate @submit.prevent="handleSubmit" class="mt-4 space-y-4">
        <div>
          <label for="adoption-why" class="block text-sm font-medium mb-1">{{ $t('modals.adoption.whyYou') }}</label>
          <textarea
            id="adoption-why"
            v-model="form.whyMe"
            rows="3"
            :maxlength="LIMITS.whyMe"
            :placeholder="$t('modals.adoption.whyPlaceholder')"
            :aria-invalid="!!errors.whyMe"
            :aria-describedby="errors.whyMe ? 'adoption-why-error' : undefined"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          ></textarea>
          <FieldError id="adoption-why-error" :message="errors.whyMe" />
        </div>

        <div>
          <label for="adoption-plan" class="block text-sm font-medium mb-1">{{ $t('modals.adoption.plan') }}</label>
          <textarea
            id="adoption-plan"
            v-model="form.actionPlan"
            rows="3"
            :maxlength="LIMITS.actionPlan"
            :placeholder="$t('modals.adoption.planPlaceholder')"
            :aria-invalid="!!errors.actionPlan"
            :aria-describedby="errors.actionPlan ? 'adoption-plan-error' : undefined"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          ></textarea>
          <FieldError id="adoption-plan-error" :message="errors.actionPlan" />
        </div>

        <div>
          <label for="adoption-portfolio" class="block text-sm font-medium mb-1">{{ $t('modals.adoption.portfolio') }}</label>
          <input
            id="adoption-portfolio"
            type="url"
            v-model="form.portfolioUrl"
            :placeholder="$t('modals.adoption.portfolioPlaceholder')"
            :aria-invalid="!!errors.portfolioUrl"
            :aria-describedby="errors.portfolioUrl ? 'adoption-portfolio-error' : undefined"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <FieldError id="adoption-portfolio-error" :message="errors.portfolioUrl" />
        </div>

        <div>
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="terms"
              v-model="form.acceptTerms"
              :aria-invalid="!!errors.acceptTerms"
              :aria-describedby="errors.acceptTerms ? 'terms-error' : undefined"
              class="rounded border-input text-primary focus:ring-ring"
            />
            <label for="terms" class="text-sm text-muted-foreground">
              {{ $t('modals.adoption.terms') }}
            </label>
          </div>
          <FieldError id="terms-error" :message="errors.acceptTerms" />
        </div>

        <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>

        <div class="flex justify-end space-x-3 pt-4 border-t border-border">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:opacity-80"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            :aria-busy="isLoading"
            class="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {{ isLoading ? $t('modals.adoption.sending') : $t('modals.adoption.submit') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'
import FieldError from '~/components/FieldError.vue'
import {
  LIMITS,
  focusFirstInvalid,
  hasErrors,
  validateTerms,
  validateText,
  validateUrl,
} from '~/lib/validation'

const props = defineProps<{
  isOpen: boolean
  isLoading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  close: []
  submit: [form: { whyMe: string; actionPlan: string; portfolioUrl: string; acceptTerms: boolean }]
}>()

const dialog = ref<HTMLElement | null>(null)

const form = reactive({
  whyMe: '',
  actionPlan: '',
  portfolioUrl: '',
  acceptTerms: false,
})

const errors = reactive({
  whyMe: '',
  actionPlan: '',
  portfolioUrl: '',
  acceptTerms: '',
})

const attempted = ref(false)

const { t } = useI18n()

const validateForm = () => {
  const result = {
    whyMe: validateText(form.whyMe, t('modals.adoption.whyYou'), LIMITS.whyMe, t('modals.adoption.whyRequired')),
    actionPlan: validateText(form.actionPlan, t('modals.adoption.plan'), LIMITS.actionPlan, t('modals.adoption.planRequired')),
    portfolioUrl: validateUrl(form.portfolioUrl, t('modals.adoption.portfolio'), true),
    acceptTerms: validateTerms(form.acceptTerms),
  }
  Object.assign(errors, result)
  return result
}

// after the first submit attempt, errors follow the fields as the user types
watch(form, () => {
  if (attempted.value) validateForm()
}, { deep: true })

// start from a clean form each time the modal opens, and move focus into it
watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return
    form.whyMe = ''
    form.actionPlan = ''
    form.portfolioUrl = ''
    form.acceptTerms = false
    attempted.value = false
    Object.assign(errors, { whyMe: '', actionPlan: '', portfolioUrl: '', acceptTerms: '' })
    await nextTick()
    dialog.value?.focus()
  }
)

const handleSubmit = async () => {
  attempted.value = true
  const result = validateForm()
  if (hasErrors(result)) {
    await nextTick()
    focusFirstInvalid()
    return
  }
  emit('submit', {
    whyMe: form.whyMe.trim(),
    actionPlan: form.actionPlan.trim(),
    portfolioUrl: form.portfolioUrl.trim(),
    acceptTerms: form.acceptTerms,
  })
}
</script>
