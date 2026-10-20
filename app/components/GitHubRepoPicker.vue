<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    modelValue?: string
    repositories?: Array<{ id: string | number; name: string; html_url?: string }>
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const selectedMode = ref<'select' | 'manual'>('select')
const manualUrl = ref(props.modelValue ?? '')

const handleSelectChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    emit('update:modelValue', target.value)
}

const handleManualInput = () => {
    emit('update:modelValue', manualUrl.value)
}
</script>

<template>
    <div class="space-y-3">
        <div class="flex items-center gap-4 text-sm">
            <button
                type="button"
                :class="[
                    'pb-1 font-medium border-b-2 transition-colors cursor-pointer',
                    selectedMode === 'select' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
                ]"
                @click="selectedMode = 'select'"
            >
                Select repository
            </button>
            <button
                type="button"
                :class="[
                    'pb-1 font-medium border-b-2 transition-colors cursor-pointer',
                    selectedMode === 'manual' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
                ]"
                @click="selectedMode = 'manual'"
            >
                Enter manually
            </button>
        </div>

        <div v-if="selectedMode === 'select'">
            <select
                class="w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                @change="handleSelectChange"
            >
                <option value="" disabled selected>Select a public repository</option>
                <option
                    v-for="repo in repositories"
                    :key="repo.id"
                    :value="repo.name"
                >
                    {{ repo.name }}
                </option>
            </select>
        </div>

        <div v-else>
            <input
                type="text"
                v-model="manualUrl"
                @input="handleManualInput"
                placeholder="e.g. owner/repository or full URL"
                class="w-full px-3 py-2 text-sm bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
        </div>
    </div>
</template>