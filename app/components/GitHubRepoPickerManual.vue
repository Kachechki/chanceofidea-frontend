<script setup lang="ts">
import { parseRepoInput } from '~/lib/validation'
import FieldError from '~/components/FieldError.vue'

// the model is whatever was typed. the form normalizes it on submit with parseRepoInput.
const model = defineModel<string>({ default: '' })

const props = defineProps<{
	id?: string
	error?: string
}>()

// a pasted github url becomes owner/repo right away
const onPaste = (event: ClipboardEvent) => {
	const text = event.clipboardData?.getData('text') ?? ''
	const parsed = parseRepoInput(text)
	if (!parsed?.owner) return
	event.preventDefault()
	model.value = `${parsed.owner}/${parsed.name}`
}

const fieldClass =
	'w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
</script>

<template>
	<div class="space-y-3">
		<input
			:id="id"
			v-model="model"
			type="text"
			autocomplete="off"
			spellcheck="false"
			placeholder="owner/repository or https://github.com/owner/repository"
			:class="fieldClass"
			:aria-invalid="!!error"
			:aria-describedby="error ? `${id}-error` : undefined"
			@paste="onPaste"
		/>

		<FieldError
			:id="`${id}-error`"
			:message="error"
		/>
	</div>
</template>
