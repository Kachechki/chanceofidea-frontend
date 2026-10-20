<script setup lang="ts">
import { Button } from '~/widgets/ui/button'
import { Lightbulb } from '@lucide/vue'

const { user, logout } = useAuth()
</script>

<template>
	<header
		class="flex items-center justify-between gap-6 px-8 py-4 bg-background border-b border-border"
	>
		<nav
			aria-label="Main"
			class="flex items-center gap-3 min-w-0"
		>
			<NuxtLink
				to="/"
				class="flex items-center gap-2 rounded-sm"
			>
				<Lightbulb
					class="w-[22px] h-[22px] text-primary shrink-0"
					aria-hidden="true"
					:stroke-width="5"
				/>
				<span class="text-lg font-bold text-foreground whitespace-nowrap">
					Chance of Idea
				</span>
			</NuxtLink>

			<Button
				variant="ghost"
				as-child
			>
				<NuxtLink to="/projects">Project Catalog</NuxtLink>
			</Button>
		</nav>

		<div class="flex items-center gap-3 shrink-0">
			<Button
				as-child
				class="bg-primary text-primary-foreground hover:bg-primary/90"
			>
				<NuxtLink to="/projects/create">Publish Project</NuxtLink>
			</Button>

			<template v-if="user">
				<NuxtLink
					to="/me"
					class="rounded-full"
					:aria-label="`Your profile (@${user.login})`"
				>
					<img
						:src="user.avatarUrl"
						alt=""
						class="w-8 h-8 rounded-full border border-border object-cover"
					/>
				</NuxtLink>
				<Button
					variant="outline"
					class="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
					@click="logout"
				>
					Log out
				</Button>
			</template>
			<Button
				v-else
				as-child
				variant="outline"
				class="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
			>
				<NuxtLink to="/login">Log in</NuxtLink>
			</Button>
		</div>
	</header>
</template>
