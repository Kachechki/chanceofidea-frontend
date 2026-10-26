<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, Clock, Info, XCircle } from '@lucide/vue'

const props = withDefaults(
	defineProps<{
		variant?: 'info' | 'warning' | 'success' | 'danger' | 'neutral'
		title: string
		steps?: string[]
	}>(),
	{
		variant: 'info',
		steps: () => [],
	}
)

const styles = {
	info: { box: 'border-primary/30 bg-primary/5', icon: Info, iconClass: 'text-primary' },
	warning: { box: 'border-amber-500/40 bg-amber-500/5', icon: Clock, iconClass: 'text-amber-500' },
	success: { box: 'border-emerald-500/40 bg-emerald-500/5', icon: CheckCircle2, iconClass: 'text-emerald-500' },
	danger: { box: 'border-destructive/40 bg-destructive/5', icon: XCircle, iconClass: 'text-destructive' },
	neutral: { box: 'border-border bg-muted/40', icon: Info, iconClass: 'text-muted-foreground' },
}

const current = computed(() => styles[props.variant])
</script>

<template>
	<div
		role="status"
		:class="['flex gap-3 rounded-xl border p-4', current.box]"
	>
		<component
			:is="current.icon"
			:class="['w-5 h-5 shrink-0 mt-0.5', current.iconClass]"
			aria-hidden="true"
		/>
		<div class="flex flex-col gap-2 min-w-0">
			<p class="font-semibold text-foreground">{{ title }}</p>
			<ol
				v-if="steps.length"
				class="list-decimal pl-5 flex flex-col gap-1 text-sm text-muted-foreground"
			>
				<li
					v-for="step in steps"
					:key="step"
				>
					{{ step }}
				</li>
			</ol>
		</div>
	</div>
</template>
