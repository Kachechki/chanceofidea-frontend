<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '~/widgets/ui/button'
import { Lightbulb, Menu, X } from '@lucide/vue'

const { user, logout } = useAuth()
const route = useRoute()

const menuOpen = ref(false)

// close the mobile menu after navigating
watch(
	() => route.fullPath,
	() => {
		menuOpen.value = false
	}
)
</script>

<template>
	<header class="bg-background border-b border-border">
		<div class="flex items-center justify-between gap-4 px-4 md:px-8 py-4">
			<nav
				aria-label="Main"
				class="flex items-center gap-3 min-w-0"
			>
				<NuxtLink
					to="/"
					class="flex items-center gap-2 rounded-sm"
				>
					<Lightbulb
						style="stroke-width: 2px !important"
						class="w-[22px] h-[22px] text-primary shrink-0"
						aria-hidden="true"
					/>
					<span class="text-lg font-bold text-foreground whitespace-nowrap">
						Chance of Idea
					</span>
				</NuxtLink>

				<Button
					variant="ghost"
					as-child
					class="hidden md:inline-flex"
				>
					<NuxtLink to="/projects">Project Catalog</NuxtLink>
				</Button>
			</nav>

			<div class="hidden md:flex items-center gap-3 shrink-0">
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

			<button
				type="button"
				class="md:hidden p-2 rounded-md text-foreground hover:bg-accent"
				aria-controls="mobile-menu"
				:aria-expanded="menuOpen"
				:aria-label="menuOpen ? 'Close menu' : 'Open menu'"
				@click="menuOpen = !menuOpen"
			>
				<X
					v-if="menuOpen"
					class="w-5 h-5"
					aria-hidden="true"
				/>
				<Menu
					v-else
					class="w-5 h-5"
					aria-hidden="true"
				/>
			</button>
		</div>

		<nav
			v-if="menuOpen"
			id="mobile-menu"
			aria-label="Mobile"
			class="md:hidden flex flex-col gap-2 border-t border-border px-4 py-4"
		>
			<Button
				variant="ghost"
				as-child
				class="justify-start"
			>
				<NuxtLink to="/projects">Project Catalog</NuxtLink>
			</Button>
			<Button
				as-child
				class="bg-primary text-primary-foreground hover:bg-primary/90 justify-start"
			>
				<NuxtLink to="/projects/create">Publish Project</NuxtLink>
			</Button>
			<template v-if="user">
				<Button
					variant="ghost"
					as-child
					class="justify-start"
				>
					<NuxtLink to="/me">Your profile (@{{ user.login }})</NuxtLink>
				</Button>
				<Button
					variant="outline"
					class="justify-start"
					@click="logout"
				>
					Log out
				</Button>
			</template>
			<Button
				v-else
				variant="outline"
				as-child
				class="justify-start"
			>
				<NuxtLink to="/login">Log in</NuxtLink>
			</Button>
		</nav>
	</header>
</template>
