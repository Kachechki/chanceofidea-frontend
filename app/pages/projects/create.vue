<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
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

const { user, ready } = useAuth()
const projectsStore = useProjectsStore()
const { selectableCategories, tags, loading, error } =
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

onMounted(() => {
    projectsStore.fetchCategories()
    projectsStore.fetchTags()
})

const toggleTag = (id: string) => {
    form.tags = form.tags.includes(id)
        ? form.tags.filter((t) => t !== id)
        : [...form.tags, id]
}

const validate = () => {
    if (!form.title.trim()) return 'Title is required'
    if (!form.repositoryName.trim()) return 'Repository name is required'
    if (!form.description.trim()) return 'Description is required'
    if (!form.categoryId) return 'Pick a category'
    return ''
}

const submit = async (publish: boolean) => {
    formError.value = validate()
    if (formError.value) return

    try {
        await projectsStore.createProject({
            title: form.title.trim(),
            description: form.description.trim(),
            repositoryName: form.repositoryName.trim(),
            categoryId: form.categoryId,
            tags: form.tags,
            publish,
            readiness: form.readinessPercent / 100,
        })
        await navigateTo('/me')
    } catch {}
}

const fieldClass =
    'w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
</script>

<template>
    <div class="max-w-3xl mx-auto px-8 py-10">
        <p
            v-if="!ready"
            class="py-24 text-center text-muted-foreground"
        >
            Loading...
        </p>

        <div
            v-else-if="!user"
            class="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-border rounded-2xl bg-card/50"
        >
            <h2 class="font-semibold text-lg text-foreground">
                Log in to publish a project
            </h2>
            <Button
                class="mt-2"
                @click="navigateTo('/login')"
                >Log in</Button
            >
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
                    @submit.prevent
                >
                    <div class="flex flex-col gap-1.5">
                        <label
                            for="title"
                            class="text-sm font-medium text-foreground"
                            >Title</label
                        >
                        <Input
                            id="title"
                            v-model="form.title"
                            placeholder="e.g. retro/walkman-firmware, Walkman Firmware"
                        />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label
                            for="repo"
                            class="text-sm font-medium text-foreground"
                            >Repository name</label
                        >
                        <Input
                            id="repo"
                            v-model="form.repositoryName"
                            placeholder="walkman-firmware"
                        />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label
                            for="description"
                            class="text-sm font-medium text-foreground"
                            >Description</label
                        >
                        <textarea
                            id="description"
                            v-model="form.description"
                            rows="4"
                            placeholder="What the project does and where you stopped"
                            :class="fieldClass"
                        />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label
                            for="category"
                            class="text-sm font-medium text-foreground"
                            >Category</label
                        >
                        <select
                            id="category"
                            v-model="form.categoryId"
                            :class="fieldClass"
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
                    </div>

                    <div class="flex flex-col gap-2">
                        <span class="text-sm font-medium text-foreground">Tags</span>
                        <div class="flex flex-wrap gap-2">
                            <button
                                v-for="tag in tags"
                                :key="tag.id"
                                type="button"
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
                            <p
                                v-if="tags.length === 0"
                                class="text-xs text-muted-foreground"
                            >
                                No tags available
                            </p>
                        </div>
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

                    <div class="flex flex-col gap-1.5 pt-2 border-t border-border">
                        <label class="text-sm font-medium text-foreground mb-1">
                            Media & External Links
                        </label>
                        <ProjectMediaUpload v-model="form.media" />
                    </div>

                    <p
                        v-if="formError || error"
                        class="text-sm text-destructive"
                    >
                        {{ formError || error }}
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
