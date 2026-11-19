<script setup lang="ts">
import { Button } from '~/widgets/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/widgets/ui/card'
import { Input } from '~/components/ui/input'
import GithubLoginButton from '~/components/GithubLoginButton.vue'

const { t } = useI18n()
useHead({ title: computed(() => t('auth.loginTitle')) })
</script>

<template>
	<div class="max-w-md mx-auto px-4 md:px-8 py-16">
		<Card class="rounded-2xl">
			<CardHeader class="text-center">
				<CardTitle class="text-2xl">{{ $t('auth.loginTitle') }}</CardTitle>
				<CardDescription>{{ $t('auth.continue') }}</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-col gap-6">
				<form class="flex flex-col gap-4 opacity-50" novalidate @submit.prevent>
					<div class="flex flex-col gap-1.5">
						<label for="email" class="text-sm font-medium text-foreground">{{ $t('auth.email') }}</label>
						<Input id="email" type="email" :placeholder="$t('auth.emailPlaceholder')" disabled />
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="password" class="text-sm font-medium text-foreground">{{ $t('auth.password') }}</label>
						<Input id="password" type="password" placeholder="••••••••" disabled />
					</div>
					<Button type="submit" disabled class="w-full">{{ $t('auth.loginWithEmail') }}</Button>
					<p class="text-xs text-muted-foreground text-center">{{ $t('auth.emailSoon') }}</p>
				</form>

				<div class="flex items-center gap-3 text-xs text-muted-foreground">
					<div class="flex-1 h-px bg-border" />
					{{ $t('common.or') }}
					<div class="flex-1 h-px bg-border" />
				</div>

				<div class="flex justify-center">
					<GithubLoginButton />
				</div>
			</CardContent>
		</Card>
	</div>
</template>
