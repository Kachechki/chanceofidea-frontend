<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Button } from '~/widgets/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '~/widgets/ui/card'
import { Input } from '~/components/ui/input'
import { useProjectsStore } from '~/stores/projectsStore'
import ProjectMediaUpload from '~/components/ProjectMediaUpload.vue'
import GitHubRepoPicker from '~/components/GitHubRepoPicker.vue'
import FieldError from '~/components/FieldError.vue'
import { errorMessage } from '~/lib/errors'
import {
    LIMITS,
    focusFirstInvalid,
    hasErrors,
    parseRepoInput,
    validateProjectForm,
    type ProjectFormErrors,
    type ProjectFormValues,
} from '~/lib/validation'

const { user, ready } = useAuth()

useHead({ title: 'Publish a Project' })

const projectsStore = useProjectsStore()
const { selectableCategories, tags, loading } = storeToRefs(projectsStore)

const form = reactive({
    title: '',
    repositoryName: '',
    description: '',
    categoryId: '',
    tags: [] as string[],
    readinessPercent: 50,
    media: {
        files: [] as File[],
        figmaUrl: '',
        demoUrl: '',
    },
})

const errors = ref<ProjectFormErrors>({})
const attempted = ref(false)
const serverError = ref('')

const values = computed<ProjectFormValues>(() => ({
    title: form.title,
    repository: form.repositoryName,
    description: form.description,
    categoryId: form.categoryId,
    tags: form.tags,
    figmaUrl: form.media.figmaUrl,
    demoUrl: form.media.demoUrl,
}))

// after the first submit attempt, errors follow the fields as the user types
watch(
    values,
    () => {
        if (attempted.value) errors.value = validateProjectForm(values.value, user.value?.login)
    },
    { deep: true }
)

onMounted(() => {
    projectsStore.fetchCategories()
    projectsStore.fetchTags()
})

const toggleTag = (id: string) => {
    form.tags = form.tags.includes(id)
        ? form.tags.filter((t) => t !== id)
        : [...form.tags, id]
}

const submit = async (publish: boolean) => {
    if (loading.value) return

    attempted.value = true
    errors.value = validateProjectForm(values.value, user.value?.login)
    if (hasErrors(errors.value)) {
        await nextTick()
        focusFirstInvalid()
        return
    }

    serverError.value = ''
    try {
        await projectsStore.createProject({
            title: form.title.trim(),
            description: form.description.trim(),
            repositoryName: parseRepoInput(form.repositoryName)?.name ?? '',
            categoryId: form.categoryId,
            tags: form.tags,
            publish,
            readiness: form.readinessPercent / 100,
        })
        await navigateTo('/me')
    } catch (err) {
        serverError.value = errorMessage(err, 'Failed to save project')
    }
}

const fieldClass =
    'w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
</script>

<template>
    <div class="max-w-3xl mx-auto px-4 md:px-8 py-10">
        <LoadingSpinner v-if="!ready" />

        <div
            v-else-if="!user"
            class="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-border rounded-2xl bg-card/50"
        >
            <h2 class="font-semibold text-lg text-foreground">
                Log in to publish a project
            </h2>
            <Button
                class="mt-2"
                as-child
            >
                <NuxtLink to="/login">Log in</NuxtLink>
            </Button>
        </div>

        <Card
            v-else
            class="rounded-2xl"
        >
            <CardHeader>
                <CardTitle class="text-2xl">Publish a project</CardTitle>
                <CardDescription>
                    Share an unfinished side project so someone else can continue it.
                </CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-6">
                <form
                    class="flex flex-col gap-5"
                    novalidate
                    @submit.prevent
                >
                    <div class="flex flex-col gap-1.5">
                        <label
                            for="title"
                            class="text-sm font-medium text-foreground"
                        >Title</label>
                        <Input
                            id="title"
                            v-model="form.title"
                            :maxlength="LIMITS.title"
                            placeholder="e.g. Walkman firmware"
                            :aria-invalid="!!errors.title"
                            :aria-describedby="errors.title ? 'title-error' : undefined"
                        />
                        <FieldError
                            id="title-error"
                            :message="errors.title"
                        />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label
                            for="repository"
                            class="text-sm font-medium text-foreground"
                        >Repository</label>
                        <GitHubRepoPicker
                            id="repository"
                            v-model="form.repositoryName"
                            :error="errors.repository"
                        />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label
                            for="description"
                            class="text-sm font-medium text-foreground"
                        >Description</label>
                        <textarea
                            id="description"
                            v-model="form.description"
                            rows="4"
                            :maxlength="LIMITS.description"
                            placeholder="What the project does and where you stopped"
                            :class="fieldClass"
                            :aria-invalid="!!errors.description"
                            :aria-describedby="errors.description ? 'description-error' : undefined"
                        />
                        <FieldError
                            id="description-error"
                            :message="errors.description"
                        />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label
                            for="category"
                            class="text-sm font-medium text-foreground"
                        >Category</label>
                        <select
                            id="category"
                            v-model="form.categoryId"
                            :class="fieldClass"
                            :aria-invalid="!!errors.categoryId"
                            :aria-describedby="errors.categoryId ? 'category-error' : undefined"
                        >
                            <option
                                value=""
                                disabled
                            >
                                Select a category
                            </option>
                            <option
                                v-for="cat in selectableCategories"
                                :key="cat.id"
                                :value="cat.id"
                            >
                                {{ cat.name }}
                            </option>
                        </select>
                        <FieldError
                            id="category-error"
                            :message="errors.categoryId"
                        />
                    </div>

                    <div class="flex flex-col gap-2">
                        <span
                            id="create-tags-label"
                            class="text-sm font-medium text-foreground"
                        >Tags</span>
                        <div
                            class="flex flex-wrap gap-2"
                            role="group"
                            aria-labelledby="create-tags-label"
                            :aria-describedby="errors.tags ? 'tags-error' : undefined"
                        >
                            <button
                                v-for="tag in tags"
                                :key="tag.id"
                                type="button"
                                :aria-pressed="form.tags.includes(tag.id)"
                                :class="[
                                    'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer',
                                    form.tags.includes(tag.id)
                                        ? 'bg-accent text-accent-foreground border-primary font-semibold'
                                        : 'bg-background text-muted-foreground border-border hover:border-muted-foreground',
                                ]"
                                @click="toggleTag(tag.id)"
                            >
                                {{ tag.name }}
                            </button>
                            <p
                                v-if="tags.length === 0"
                                class="text-xs text-muted-foreground"
                            >
                                No tags available
                            </p>
                        </div>
                        <FieldError
                            id="tags-error"
                            :message="errors.tags"
                        />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label
                            for="readiness"
                            class="text-sm font-medium text-foreground"
                        >
                            Readiness: {{ form.readinessPercent }}%
                        </label>
                        <input
                            id="readiness"
                            v-model.number="form.readinessPercent"
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                        />
                    </div>

                    <!-- not yet for the mvp -->
                    <!--<div class="flex flex-col gap-1.5 pt-2 border-t border-border">
                        <span
                            id="create-media-label"
                            class="text-sm font-medium text-foreground mb-1"
                        >
                            Media &amp; External Links
                        </span>
                        <div
                            role="group"
                            aria-labelledby="create-media-label"
                        >
                            <ProjectMediaUpload
                                v-model="form.media"
                                :errors="{ figmaUrl: errors.figmaUrl, demoUrl: errors.demoUrl }"
                            />
                        </div>
                    </div>-->

                    <p
                        v-if="serverError"
                        role="alert"
                        class="text-sm text-destructive"
                    >
                        {{ serverError }}
                    </p>

                    <div class="flex items-center justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            :disabled="loading"
                            @click="submit(false)"
                        >
                            Save as draft
                        </Button>
                        <Button
                            type="button"
                            :disabled="loading"
                            @click="submit(true)"
                        >
                            {{ loading ? 'Publishing...' : 'Publish' }}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
</template>
