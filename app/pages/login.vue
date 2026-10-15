<script setup lang="ts">
import { Button } from '~/widgets/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/widgets/ui/card'
import { Input } from '~/components/ui/input'
import GithubLoginButton from '~/components/GithubLoginButton.vue'
</script>

<template>
	<div class="max-w-md mx-auto px-8 py-16">
		<Card class="rounded-2xl">
			<CardHeader class="text-center">
				<CardTitle class="text-2xl">Log in</CardTitle>
				<CardDescription>Continue to Chance of Idea</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-col gap-6">
				<form class="flex flex-col gap-4 opacity-50" @submit.prevent>
					<div class="flex flex-col gap-1.5">
						<label for="email" class="text-sm font-medium text-foreground">Email</label>
						<Input id="email" type="email" placeholder="you@example.com" disabled />
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="password" class="text-sm font-medium text-foreground">Password</label>
						<Input id="password" type="password" placeholder="••••••••" disabled />
					</div>
					<Button type="submit" disabled class="w-full">Log in with email</Button>
					<p class="text-xs text-muted-foreground text-center">Email login is coming soon.</p>
				</form>

				<div class="flex items-center gap-3 text-xs text-muted-foreground">
					<div class="flex-1 h-px bg-border" />
					or
					<div class="flex-1 h-px bg-border" />
				</div>

				<div class="flex justify-center">
					<GithubLoginButton />
				</div>
			</CardContent>
		</Card>
	</div>
</template>
