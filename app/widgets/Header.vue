<script setup lang="ts">
import { Button } from '~/widgets/ui/button'
import { Lightbulb } from '@lucide/vue'

const { user, logout } = useAuth()
</script>

<template>
	<header
		class="flex items-center justify-between gap-6 px-8 py-4 bg-background border-b border-border"
	>
		<div class="flex items-center gap-3 min-w-0">
			<Lightbulb
				class="w-[22px] h-[22px] text-primary shrink-0"
				:troke-width="5"
			/>
			<button
				type="button"
				@click="navigateTo('/')"
			>
				<h1 class="text-lg font-bold text-foreground whitespace-nowrap m-0">
					Chance of Idea
				</h1>
			</button>
			<!--<span class="text-sm text-muted-foreground whitespace-nowrap pl-2 border-l border-border"></span>-->
			<Button
				variant="ghost"
				@click="navigateTo('/publish')"
				>Publish Project</Button
			>
			<Button
				variant="ghost"
				@click="navigateTo('/projects')"
				>Project Catalog</Button
			>
		</div>
		<div class="flex items-center gap-3 shrink-0">
			<Button class="bg-primary text-primary-foreground hover:bg-primary/90"
				>Publish Project</Button
			>
			<template v-if="user">
				<img
					:src="user.avatarUrl"
					:alt="user.login"
					class="w-8 h-8 rounded-full border border-border object-cover"
				/>
				<Button
					variant="outline"
					class="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
					@click="logout"
					>Log out</Button
				>
			</template>
			<Button
				v-else
				variant="outline"
				class="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
				@click="navigateTo('/login')"
				>Log in</Button
			>
		</div>
	</header>
</template>
