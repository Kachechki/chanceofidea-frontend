<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
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

const route = useRoute()
const projectId = route.params.id as string

const { user, ready } = useAuth()

useHead({ title: 'Edit Project' })
const projectsStore = useProjectsStore()
const { currentProject, selectableCategories, tags, loading, error } =
    storeToRefs(projectsStore)

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
const formError = ref('')

onMounted(async () => {
    await Promise.all([
        projectsStore.fetchCategories(),
        projectsStore.fetchTags(),
        projectsStore.fetchProjectById(projectId),
    ])

    if (currentProject.value) {
        form.title = currentProject.value.title
        form.description = currentProject.value.description
        form.repositoryName = currentProject.value.repositoryName || ''
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

const validate = () => {
    if (!form.title.trim()) return 'Title is required'
    if (!form.description.trim()) return 'Description is required'
    if (!form.categoryId) return 'Pick a category'
    return ''
}

const submit = async () => {
    formError.value = validate()
    if (formError.value) return

    try {
        await $fetch(`/api/project`, {
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
        await navigateTo(`/projects/${projectId}`)
    } catch (err: any) {
        formError.value = err?.data?.message || 'Failed to update project'
    }
}

const fieldClass =
    'w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
</script>

<template>
    <div class="max-w-3xl mx-auto px-8 py-10">
        <LoadingSpinner v-if="!ready || loading" />

        <div
            v-else-if="!user"
            class="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-border rounded-2xl bg-card/50"
        >
            <h2 class="font-semibold text-lg text-foreground">Log in to edit project</h2>
            <Button as-child class="mt-2">
                <NuxtLink to="/login">Log in</NuxtLink>
            </Button>
        </div>

        <Card v-else class="rounded-2xl">
            <CardHeader>
                <CardTitle class="text-2xl">Edit project</CardTitle>
                <CardDescription>
                    Update your project details and media assets.
                </CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-6">
                <form class="flex flex-col gap-5" @submit.prevent>
                    <div class="flex flex-col gap-1.5">
                        <label for="title" class="text-sm font-medium text-foreground">Title</label>
                        <Input id="title" v-model="form.title" />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label for="description" class="text-sm font-medium text-foreground">Description</label>
                        <textarea
                            id="description"
                            v-model="form.description"
                            rows="4"
                            :class="fieldClass"
                        />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label for="category" class="text-sm font-medium text-foreground">Category</label>
                        <select id="category" v-model="form.categoryId" :class="fieldClass">
                            <option value="" disabled>Select a category</option>
                            <option
                                v-for="cat in selectableCategories"
                                :key="cat.id"
                                :value="cat.id"
                            >
                                {{ cat.name }}
                            </option>
                        </select>
                    </div>

                    <div class="flex flex-col gap-2">
                        <span id="edit-tags-label" class="text-sm font-medium text-foreground">Tags</span>
                        <div class="flex flex-wrap gap-2" role="group" aria-labelledby="edit-tags-label">
                            <button
                                v-for="tag in tags"
                                :key="tag.id"
                                type="button"
                                :aria-pressed="form.tags.includes(tag.id)"
                                @click="toggleTag(tag.id)"
                                :class="[
                                    'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer',
                                    form.tags.includes(tag.id)
                                        ? 'bg-accent text-accent-foreground border-primary font-semibold'
                                        : 'bg-background text-muted-foreground border-border hover:border-muted-foreground',
                                ]"
                            >
                                {{ tag.name }}
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label for="readiness" class="text-sm font-medium text-foreground">
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

                    <div class="flex flex-col gap-1.5 pt-2 border-t border-border">
                        <span id="edit-media-label" class="text-sm font-medium text-foreground mb-1">
                            Media & External Links
                        </span>
                        <div role="group" aria-labelledby="edit-media-label">
                            <ProjectMediaUpload v-model="form.media" />
                        </div>
                    </div>

                    <p v-if="formError || error" role="alert" class="text-sm text-destructive">
                        {{ formError || error }}
                    </p>

                    <div class="flex items-center justify-end gap-3 pt-4 border-t border-border">
                        <Button
                            as-child
                            variant="outline"
                        >
                            <NuxtLink :to="`/projects/${projectId}`">Cancel</NuxtLink>
                        </Button>
                        <Button type="button" @click="submit">
                            Save changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
</template>