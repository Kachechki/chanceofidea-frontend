<script setup lang="ts">
defineProps<{
	id: string
	message?: string
}>()
</script>

<template>
	<p
		v-if="message"
		:id="id"
		class="text-xs text-destructive"
	>
		{{ message }}
	</p>
</template>
