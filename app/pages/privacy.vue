<script setup lang="ts">
const { t } = useI18n()
useHead({
	title: computed(() => t('legal.privacy.documentTitle')),
})
</script>

<template>
	<div class="max-w-4xl mx-auto px-4 md:px-8 py-12">
		<h1 class="text-3xl font-bold text-foreground mb-6">{{ $t('legal.privacy.title') }}</h1>
		<p class="text-sm text-muted-foreground mb-8">{{ $t('legal.updated') }}</p>

		<div class="space-y-6 text-foreground/90 leading-relaxed">
			<section>
				<h2 class="text-xl font-semibold text-foreground mb-2">{{ $t('legal.privacy.s1Title') }}</h2>
				<p class="text-sm text-muted-foreground">{{ $t('legal.privacy.s1Body') }}</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold text-foreground mb-2">{{ $t('legal.privacy.s2Title') }}</h2>
				<ul class="list-disc list-inside text-sm text-muted-foreground space-y-1">
					<li><strong>{{ $t('legal.privacy.s2GithubLabel') }}</strong> {{ $t('legal.privacy.s2Github') }}</li>
					<li><strong>{{ $t('legal.privacy.s2RepoLabel') }}</strong> {{ $t('legal.privacy.s2Repo') }}</li>
					<li><strong>{{ $t('legal.privacy.s2ActivityLabel') }}</strong> {{ $t('legal.privacy.s2Activity') }}</li>
				</ul>
			</section>

			<section>
				<h2 class="text-xl font-semibold text-foreground mb-2">{{ $t('legal.privacy.s3Title') }}</h2>
				<p class="text-sm text-muted-foreground mb-2">{{ $t('legal.privacy.s3Intro') }}</p>
				<ul class="list-disc list-inside text-sm text-muted-foreground space-y-1">
					<li>{{ $t('legal.privacy.s3a') }}</li>
					<li>{{ $t('legal.privacy.s3b') }}</li>
					<li>{{ $t('legal.privacy.s3c') }}</li>
					<li>{{ $t('legal.privacy.s3d') }}</li>
				</ul>
			</section>

			<section>
				<h2 class="text-xl font-semibold text-foreground mb-2">{{ $t('legal.privacy.s4Title') }}</h2>
				<p class="text-sm text-muted-foreground">{{ $t('legal.privacy.s4Body') }}</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold text-foreground mb-2">{{ $t('legal.privacy.s5Title') }}</h2>
				<p class="text-sm text-muted-foreground">{{ $t('legal.privacy.s5Body') }}</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold text-foreground mb-2">{{ $t('legal.privacy.s6Title') }}</h2>
				<p class="text-sm text-muted-foreground">{{ $t('legal.privacy.s6Body') }}</p>
			</section>
		</div>
	</div>
</template>
