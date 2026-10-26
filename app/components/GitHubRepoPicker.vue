<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useProjectsStore } from '~/stores/projectsStore'
import { parseRepoInput } from '~/lib/validation'
import FieldError from '~/components/FieldError.vue'
import LoadingSpinner from '~/components/LoadingSpinner.vue'

// the model is the repo name (select mode) or whatever was typed (manual mode).
// the form normalizes it on submit with parseRepoInput.
const model = defineModel<string>({ default: '' })

const props = defineProps<{
	id?: string
	error?: string
}>()

const projectsStore = useProjectsStore()
const { githubRepos, githubReposLoading, githubReposError } = storeToRefs(projectsStore)

const mode = ref<'select' | 'manual'>('select')

onMounted(() => projectsStore.fetchGithubRepos())

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
		<div class="flex items-center gap-4 text-sm" role="group" aria-label="Repository input mode">
			<button
				type="button"
				:aria-pressed="mode === 'select'"
				:class="[
					'pb-1 font-medium border-b-2 transition-colors cursor-pointer',
					mode === 'select' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground',
				]"
				@click="mode = 'select'"
			>
				Select repository
			</button>
			<button
				type="button"
				:aria-pressed="mode === 'manual'"
				:class="[
					'pb-1 font-medium border-b-2 transition-colors cursor-pointer',
					mode === 'manual' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground',
				]"
				@click="mode = 'manual'"
			>
				Enter manually
			</button>
		</div>

		<div v-if="mode === 'select'">
			<LoadingSpinner
				v-if="githubReposLoading"
				compact
				size="w-5 h-5"
			/>
			<div
				v-else-if="githubReposError"
				role="status"
				class="flex flex-col gap-2 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
			>
				<p>{{ githubReposError }}</p>
				<button
					type="button"
					class="w-fit text-primary underline underline-offset-4 cursor-pointer"
					@click="mode = 'manual'"
				>
					Enter the repository manually instead
				</button>
			</div>
			<p
				v-else-if="githubRepos.length === 0"
				class="text-sm text-muted-foreground"
			>
				No public repositories found on your account.
				<button
					type="button"
					class="text-primary underline underline-offset-4 cursor-pointer"
					@click="mode = 'manual'"
				>
					Enter one manually
				</button>
			</p>
			<select
				v-else
				:id="id"
				v-model="model"
				:class="fieldClass"
				:aria-invalid="!!error"
				:aria-describedby="error ? `${id}-error` : undefined"
			>
				<option value="" disabled>Select one of your public repositories</option>
				<option
					v-for="repo in githubRepos"
					:key="repo.id"
					:value="repo.name"
				>
					{{ repo.name }}
				</option>
			</select>
		</div>

		<div v-else>
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
		</div>

		<FieldError
			:id="`${id}-error`"
			:message="error"
		/>
	</div>
</template>
