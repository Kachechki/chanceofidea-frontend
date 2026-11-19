<script setup lang="ts">
import { Clock, FileBox, HeartHandshake, Package, Users } from '@lucide/vue'
import { Button } from '~/widgets/ui/button'
import { Info } from '@lucide/vue'
import { Upload } from '@lucide/vue'
import { Sprout } from '@lucide/vue'
import { Card, CardContent } from '~/widgets/ui/card'
import LandingCard from '~/widgets/LandingCard.vue'
const { user, ready } = useAuth()
</script>

<template>
	<section class="relative overflow-hidden">
		<div
			class="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
		>
			<div class="flex flex-col gap-6">
				<h1 class="text-4xl md:text-5xl font-bold text-foreground leading-tight">
					{{ $t('home.title') }}
				</h1>
				<p class="text-lg text-muted-foreground leading-relaxed max-w-xl">
					{{ $t('home.description') }}
				</p>

				<div class="flex flex-wrap items-center gap-4 mt-2">
					<Button
						v-if="user"
						as-child
						size="lg"
						class="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
					>
						<NuxtLink to="/me">{{ $t('home.backToProfile') }}</NuxtLink>
					</Button>
					<Button
						v-else
						as-child
						size="lg"
						class="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
					>
						<NuxtLink to="/login">{{ $t('home.login') }}</NuxtLink>
					</Button>
					<Button
						as-child
						size="lg"
						variant="outline"
						class="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
					>
						<NuxtLink to="/projects">{{ $t('home.findProject') }}</NuxtLink>
					</Button>
				</div>
			</div>
			<div class="relative flex justify-center lg:justify-end">
				<div
					class="w-full max-w-md aspect-square rounded-2xl bg-secondary/50 flex items-center justify-center"
				>
					<FileBox
						class="w-32 h-32 text-primary opacity-40"
						aria-hidden="true"
						stroke-width="1"
					/>
				</div>
			</div>
		</div>
	</section>
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-8 py-4">
		<LandingCard
			:count="3842"
			:description="$t('home.stats.total')"
			:icon="Package"
		/>
		<LandingCard
			:count="1255"
			:description="$t('home.stats.adopted')"
			:icon="HeartHandshake"
		/>
		<LandingCard
			:count="4980"
			:description="$t('home.stats.developers')"
			:icon="Users"
		/>
		<LandingCard
			:count="12430"
			:description="$t('home.stats.hours')"
			:icon="Clock"
		/>
	</div>
	<section class="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-8">
		<Card class="border-primary/20 bg-primary/5">
			<CardContent class="flex items-start gap-4 py-2">
				<Info class="w-6 h-6 text-primary shrink-0 mt-1" />
				<div class="flex flex-col gap-1">
					<h3 class="text-lg font-semibold text-foreground">
						{{ $t('home.startTitle') }}
					</h3>
					<p class="text-muted-foreground">
						{{ $t('home.startBody') }}
					</p>
				</div>
			</CardContent>
		</Card>
	</section>
	<section class="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row gap-8 md:justify-between">
		<div class="flex-1">
			<div class="flex justify-between">
				<div>
					<h2 class="text-lg font-semibold text-foreground">{{ $t('home.authorsTitle') }}</h2>
					<p class="text-muted-foreground">
						{{ $t('home.authorsBody') }}
					</p>
				</div>
				<div
					class="bg-primary rounded-full w-16 h-16 shrink-0 flex items-center justify-center"
				>
					<Upload style="color: var(--foreground) !important" />
				</div>
			</div>
			<ul class="flex flex-col gap-6 mt-8">
				<li class="flex gap-6">
					<span class="text-xl font-bold font-mono text-primary">1</span>
					<div>
						<h3 class="font-semibold text-foreground">
							{{ $t('home.authors.step1Title') }}
						</h3>
						<p class="text-muted-foreground text-sm">
							{{ $t('home.authors.step1Body') }}
						</p>
					</div>
				</li>
				<li class="flex gap-6">
					<span class="text-xl font-bold font-mono text-primary">2</span>
					<div>
						<h3 class="font-semibold text-foreground">
							{{ $t('home.authors.step2Title') }}
						</h3>
						<p class="text-muted-foreground text-sm">
							{{ $t('home.authors.step2Body') }}
						</p>
					</div>
				</li>
				<li class="flex gap-6">
					<span class="text-xl font-bold font-mono text-primary">3</span>
					<div>
						<h3 class="font-semibold text-foreground">{{ $t('home.authors.step3Title') }}</h3>
						<p class="text-muted-foreground text-sm">
							{{ $t('home.authors.step3Body') }}
						</p>
					</div>
				</li>
			</ul>
		</div>
		<div class="flex-1">
			<div class="flex justify-between">
				<div>
					<h2 class="text-lg font-semibold text-foreground">{{ $t('home.adoptersTitle') }}</h2>
					<p class="text-muted-foreground">
						{{ $t('home.adoptersBody') }}
					</p>
				</div>
				<div
					class="bg-primary rounded-full w-16 h-16 shrink-0 flex items-center justify-center"
				>
					<Sprout style="color: var(--foreground) !important" />
				</div>
			</div>
			<ul class="flex flex-col gap-6 mt-8">
				<li class="flex gap-6">
					<span class="text-xl font-bold font-mono text-primary">1</span>
					<div>
						<h3 class="font-semibold text-foreground">{{ $t('home.adopters.step1Title') }}</h3>
						<p class="text-muted-foreground text-sm">
							{{ $t('home.adopters.step1Body') }}
						</p>
					</div>
				</li>
				<li class="flex gap-6">
					<span class="text-xl font-bold font-mono text-primary">2</span>
					<div>
						<h3 class="font-semibold text-foreground">{{ $t('home.adopters.step2Title') }}</h3>
						<p class="text-muted-foreground text-sm">
							{{ $t('home.adopters.step2Body') }}
						</p>
					</div>
				</li>
				<li class="flex gap-6">
					<span class="text-xl font-bold font-mono text-primary">3</span>
					<div>
						<h3 class="font-semibold text-foreground">{{ $t('home.adopters.step3Title') }}</h3>
						<p class="text-muted-foreground text-sm">
							{{ $t('home.adopters.step3Body') }}
						</p>
					</div>
				</li>
			</ul>
		</div>
	</section>
</template>
