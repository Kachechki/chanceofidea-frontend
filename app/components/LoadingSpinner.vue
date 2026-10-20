<script setup lang="ts">
import { LoaderCircle } from '@lucide/vue'

withDefaults(
	defineProps<{
		// tailwind size classes for the icon
		size?: string
	}>(),
	{
		size: 'w-15 h-16',
	}
)
</script>

<template>
	<div
		role="status"
		class="flex items-center justify-center py-16"
	>
		<LoaderCircle
			:class="['animate-spin text-muted-foreground!', size]"
			aria-hidden="true"
		/>
		<span class="sr-only">Loading</span>
	</div>
</template>
