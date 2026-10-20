<template>
  <div class="space-y-6">
    <div
      role="button"
      tabindex="0"
      aria-label="Upload project files. Press Enter to browse, or drop files here."
      class="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-6 text-center hover:border-zinc-400 transition-colors cursor-pointer"
      @click="triggerFileInput"
      @keydown.enter.prevent="triggerFileInput"
      @keydown.space.prevent="triggerFileInput"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input
        type="file"
        multiple
        class="hidden"
        ref="fileInput"
        tabindex="-1"
        aria-hidden="true"
        @change="handleFileSelect"
      />
      <div class="flex flex-col items-center justify-center">
        <svg class="w-10 h-10 text-zinc-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Drag and drop files here, or <span class="text-indigo-600 dark:text-indigo-400 underline">browse</span>
        </p>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Screenshots, diagrams, or project assets</p>
      </div>
    </div>

    <div v-if="selectedFiles.length > 0" class="space-y-2">
      <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Uploaded files</p>
      <ul class="space-y-1">
        <li
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="text-sm text-zinc-600 dark:text-zinc-400 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800 px-3 py-2 rounded-md"
        >
          <span class="truncate max-w-xs">{{ file.name }}</span>
          <button
            type="button"
            class="text-red-500 hover:text-red-700 text-xs font-medium"
            :aria-label="`Remove ${file.name}`"
            @click="removeFile(index)"
          >
            Remove
          </button>
        </li>
      </ul>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label for="media-figma" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Figma URL
        </label>
        <input
          id="media-figma"
          type="url"
          v-model="figmaUrl"
          @input="emitUpdate"
          placeholder="https://figma.com/file/..."
          class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :aria-invalid="!!errors?.figmaUrl"
          :aria-describedby="errors?.figmaUrl ? 'media-figma-error' : undefined"
        />
        <FieldError id="media-figma-error" :message="errors?.figmaUrl" />
      </div>

      <div>
        <label for="media-demo" class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          Demo Video URL
        </label>
        <input
          id="media-demo"
          type="url"
          v-model="demoUrl"
          @input="emitUpdate"
          placeholder="https://youtube.com/watch?v=..."
          class="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :aria-invalid="!!errors?.demoUrl"
          :aria-describedby="errors?.demoUrl ? 'media-demo-error' : undefined"
        />
        <FieldError id="media-demo-error" :message="errors?.demoUrl" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FieldError from '~/components/FieldError.vue'

interface MediaData {
  files: File[]
  figmaUrl: string
  demoUrl: string
}

const props = defineProps<{
  modelValue?: MediaData
  errors?: { figmaUrl?: string; demoUrl?: string }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: MediaData): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const figmaUrl = ref(props.modelValue?.figmaUrl ?? '')
const demoUrl = ref(props.modelValue?.demoUrl ?? '')
const selectedFiles = ref<File[]>(props.modelValue?.files ?? [])

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(target.files)]
    emitUpdate()
  }
}

const handleDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(event.dataTransfer.files)]
    emitUpdate()
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  emitUpdate()
}

const emitUpdate = () => {
  emit('update:modelValue', {
    files: selectedFiles.value,
    figmaUrl: figmaUrl.value,
    demoUrl: demoUrl.value,
  })
}
</script>