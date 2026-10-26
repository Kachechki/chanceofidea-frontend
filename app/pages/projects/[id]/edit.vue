<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
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
import FieldError from '~/components/FieldError.vue'
import { errorMessage } from '~/lib/errors'
import { getProjectFullName } from '~/lib/project'
import { ProjectStatusEnum } from '~/types/project'
import {
    LIMITS,
    focusFirstInvalid,
    hasErrors,
    validateProjectForm,
    type ProjectFormErrors,
    type ProjectFormValues,
} from '~/lib/validation'

const route = useRoute()
const projectId = route.params.id as string

const { user, ready } = useAuth()

useHead({ title: 'Edit Project' })

const projectsStore = useProjectsStore()
const { currentProject, selectableCategories, tags, loading } = storeToRefs(projectsStore)

const form = reactive({
    title: '',
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
const saving = ref(false)

// the repository cannot change after publishing, so it is not part of the edit form
const repositoryName = computed(() =>
    currentProject.value ? getProjectFullName(currentProject.value) : ''
)

const values = computed<ProjectFormValues>(() => ({
    title: form.title,
    description: form.description,
    categoryId: form.categoryId,
    tags: form.tags,
    figmaUrl: form.media.figmaUrl,
    demoUrl: form.media.demoUrl,
}))

watch(
    values,
    () => {
        if (attempted.value) errors.value = validateProjectForm(values.value)
    },
    { deep: true }
)

onMounted(async () => {
    await Promise.all([
        projectsStore.fetchCategories(),
        projectsStore.fetchTags(),
        projectsStore.fetchProjectById(projectId),
    ])

    if (currentProject.value) {
        form.title = currentProject.value.title
        form.description = currentProject.value.description
        form.categoryId = currentProject.value.category?.id || ''
        form.tags = currentProject.value.tags?.map((t) => t.id) || []
        form.readinessPercent = Math.round((currentProject.value.readiness || 0.5) * 100)
    }
})

const toggleTag = (id: string) => {
    form.tags = form.tags.includes(id)
        ? form.tags.filter((t) => t !== id)
        : [...form.tags, id]
}

const isDraft = computed(() => currentProject.value?.status === ProjectStatusEnum.DRAFT)

// saves the edits, then optionally publishes a draft. the publish step only runs after a successful save.
const submit = async (publish = false) => {
    if (loading.value || saving.value) return

    attempted.value = true
    errors.value = validateProjectForm(values.value)
    if (hasErrors(errors.value)) {
        await nextTick()
        focusFirstInvalid()
        return
    }

    serverError.value = ''
    saving.value = true
    let saved = false
    try {
        await $fetch('/api/project', {
            method: 'PATCH',
            body: {
                id: projectId,
                title: form.title.trim(),
                description: form.description.trim(),
                categoryId: form.categoryId,
                tags: form.tags,
                readiness: form.readinessPercent / 100,
            },
        })
        saved = true
        if (publish) {
            await $fetch('/api/project/publish', {
                method: 'POST',
                query: { id: projectId },
            })
        }
        await navigateTo(`/projects/${projectId}`)
    } catch (err) {
        const fallback = publish && saved ? 'Changes saved, but publishing failed' : 'Failed to save project'
        serverError.value = errorMessage(err, fallback)
    } finally {
        saving.value = false
    }
}

const fieldClass =
    'w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
</script>

<template>
    <div class="max-w-3xl mx-auto px-4 md:px-8 py-10">
        <LoadingSpinner v-if="!ready || loading" />

        <div
            v-else-if="!user"
            class="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-border rounded-2xl bg-card/50"
        >
            <h2 class="font-semibold text-lg text-foreground">Log in to edit project</h2>
            <Button
                as-child
                class="mt-2"
            >
                <NuxtLink to="/login">Log in</NuxtLink>
            </Button>
        </div>

        <Card
            v-else
            class="rounded-2xl"
        >
            <CardHeader>
                <CardTitle class="text-2xl">Edit project</CardTitle>
                <CardDescription>
                    Update your project details and media assets.
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
                            :aria-invalid="!!errors.title"
                            :aria-describedby="errors.title ? 'title-error' : undefined"
                        />
                        <FieldError
                            id="title-error"
                            :message="errors.title"
                        />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <span class="text-sm font-medium text-foreground">Repository</span>
                        <p class="text-sm font-mono text-muted-foreground break-all">
                            {{ repositoryName || 'Unknown repository' }}
                        </p>
                        <p class="text-xs text-muted-foreground">
                            The repository is fixed once a project is published.
                        </p>
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
                            id="edit-tags-label"
                            class="text-sm font-medium text-foreground"
                        >Tags</span>
                        <div
                            class="flex flex-wrap gap-2"
                            role="group"
                            aria-labelledby="edit-tags-label"
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
                            id="edit-media-label"
                            class="text-sm font-medium text-foreground mb-1"
                        >
                            Media &amp; External Links
                        </span>
                        <div
                            role="group"
                            aria-labelledby="edit-media-label"
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

                    <div class="flex items-center justify-end gap-3 pt-4 border-t border-border">
                        <Button
                            as-child
                            variant="outline"
                        >
                            <NuxtLink :to="`/projects/${projectId}`">Cancel</NuxtLink>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            :disabled="loading || saving"
                            @click="submit(false)"
                        >
                            Save changes
                        </Button>
                        <Button
                            v-if="isDraft"
                            type="button"
                            :disabled="loading || saving"
                            @click="submit(true)"
                        >
                            {{ saving ? 'Publishing...' : 'Publish' }}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
</template>
