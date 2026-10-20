<script setup lang="ts">
import { LoaderCircle } from '@lucide/vue'

withDefaults(
	defineProps<{
		// tailwind size classes for the icon
		size?: string
		// drops the block padding for inline use
		compact?: boolean
	}>(),
	{
		size: 'w-8 h-8',
		compact: false,
	}
)
</script>

<template>
	<div
		role="status"
		:class="['flex items-center justify-center', compact ? '' : 'py-16']"
	>
		<LoaderCircle
			:class="['animate-spin text-muted-foreground', size]"
			aria-hidden="true"
		/>
		<span class="sr-only">Loading</span>
	</div>
</template>
