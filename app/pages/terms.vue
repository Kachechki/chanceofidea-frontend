<script setup lang="ts">
const { t } = useI18n()
useHead({
	title: computed(() => t('legal.terms.documentTitle')),
})
</script>

<template>
	<div class="max-w-4xl mx-auto px-4 md:px-8 py-12">
		<h1 class="text-3xl font-bold text-foreground mb-6">{{ $t('legal.terms.title') }}</h1>
		<p class="text-sm text-muted-foreground mb-8">{{ $t('legal.updated') }}</p>

		<div class="space-y-6 text-foreground/90 leading-relaxed">
			<p class="text-sm text-muted-foreground">{{ $t('legal.terms.intro') }}</p>

			<section>
				<h2 class="text-xl font-semibold text-foreground mb-2">{{ $t('legal.terms.s1Title') }}</h2>
				<p class="text-sm text-muted-foreground">{{ $t('legal.terms.s1Body') }}</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold text-foreground mb-2">{{ $t('legal.terms.s2Title') }}</h2>
				<ul class="list-disc list-inside text-sm text-muted-foreground space-y-1">
					<li><strong>{{ $t('legal.terms.s2LoginLabel') }}</strong> {{ $t('legal.terms.s2Login') }}</li>
					<li><strong>{{ $t('legal.terms.s2AccuracyLabel') }}</strong> {{ $t('legal.terms.s2Accuracy') }}</li>
				</ul>
			</section>

			<section>
				<h2 class="text-xl font-semibold text-foreground mb-2">{{ $t('legal.terms.s3Title') }}</h2>
				<ul class="list-disc list-inside text-sm text-muted-foreground space-y-1">
					<li><strong>{{ $t('legal.terms.s3OwnLabel') }}</strong> {{ $t('legal.terms.s3Own') }}</li>
					<li><strong>{{ $t('legal.terms.s3VerifyLabel') }}</strong> {{ $t('legal.terms.s3Verify') }}</li>
					<li><strong>{{ $t('legal.terms.s3HandoverLabel') }}</strong> {{ $t('legal.terms.s3Handover') }}</li>
				</ul>
			</section>

			<section>
				<h2 class="text-xl font-semibold text-foreground mb-2">{{ $t('legal.terms.s4Title') }}</h2>
				<p class="text-sm text-muted-foreground mb-2">{{ $t('legal.terms.s4Intro') }}</p>
				<ul class="list-disc list-inside text-sm text-muted-foreground space-y-1">
					<li>{{ $t('legal.terms.s4a') }}</li>
					<li>{{ $t('legal.terms.s4b') }}</li>
					<li>{{ $t('legal.terms.s4c') }}</li>
					<li>{{ $t('legal.terms.s4d') }}</li>
				</ul>
			</section>

			<section>
				<h2 class="text-xl font-semibold text-foreground mb-2">{{ $t('legal.terms.s5Title') }}</h2>
				<p class="text-sm text-muted-foreground mb-2"><strong>{{ $t('legal.terms.s5AsIsLabel') }}</strong> {{ $t('legal.terms.s5AsIs') }}</p>
				<p class="text-sm text-muted-foreground mb-2"><strong>{{ $t('legal.terms.s5LimitLabel') }}</strong> {{ $t('legal.terms.s5Limit') }}</p>
				<ul class="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-4">
					<li>{{ $t('legal.terms.s5a') }}</li>
					<li>{{ $t('legal.terms.s5b') }}</li>
					<li>{{ $t('legal.terms.s5c') }}</li>
				</ul>
			</section>

			<section>
				<h2 class="text-xl font-semibold text-foreground mb-2">{{ $t('legal.terms.s6Title') }}</h2>
				<p class="text-sm text-muted-foreground">{{ $t('legal.terms.s6Body') }}</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold text-foreground mb-2">{{ $t('legal.terms.s7Title') }}</h2>
				<p class="text-sm text-muted-foreground">{{ $t('legal.terms.s7Body') }}</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold text-foreground mb-2">{{ $t('legal.terms.s8Title') }}</h2>
				<p class="text-sm text-muted-foreground">{{ $t('legal.terms.s8Body') }}</p>
			</section>
		</div>
	</div>
</template>
