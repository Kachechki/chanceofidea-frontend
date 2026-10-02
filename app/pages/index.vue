<script setup lang="ts">
import Header from "~/widgets/Header.vue";
import {Button} from "~/widgets/ui/button";
import {Clock, FileBox, HeartHandshake, Package, Users} from '@lucide/vue';
import { Info } from '@lucide/vue';
import {Card, CardContent} from "~/widgets/ui/card";
import LandingCard from "~/widgets/LandingCard.vue";
import Header from '~/widgets/Header.vue'
import { Button } from '~/widgets/ui/button'
import { FileBox } from '@lucide/vue'
import { Info } from '@lucide/vue'
import { Upload } from '@lucide/vue'
import { Sprout } from '@lucide/vue'
import { Card, CardContent } from '~/widgets/ui/card'
import LandingCard from '~/widgets/LandingCard.vue'
</script>
<template>
	<Header />
	<!-- hero -->
	<section class="relative overflow-hidden">
		<div
			class="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
		>
			<div class="flex flex-col gap-6">
				<h1 class="text-5xl font-bold text-foreground leading-tight">
					Give your unfinished side project a second life
				</h1>
				<span class="text-lg text-muted-foreground leading-relaxed max-w-xl">
					Second Chance Archive connects developers who want to pass on
					abandoned or unfinished projects with adopters ready to continue the
					work — preserving ideas and saving development time.
				</span>
				<div class="flex items-center gap-4 mt-2">
					<Button
						size="lg"
						class="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
					>
						<FileBox class="w-5 h-5" />
						Publish project
					</Button>
					<Button
						size="lg"
						variant="outline"
						class="border-input text-foreground hover:bg-accent hover:text-accent-foreground"
					>
						Find a project
					</Button>
				</div>
			</div>
			<div class="relative flex justify-center lg:justify-end">
				<div
					class="w-full max-w-md aspect-square rounded-2xl bg-secondary/50 flex items-center justify-center"
				>
					<FileBox
						class="w-32 h-32 text-primary opacity-40"
						stroke-width="1"
					/>
				</div>
			</div>
		</div>
	</section>
  <!-- cards -->
  <div class="grid grid-rows-1 gap-6 grid-cols-4 gap-8 m-8">
    <LandingCard  :count="3842" description="Total projects" :icon="Package"  />
    <LandingCard  :count="1255" description="Adopted projects" :icon="HeartHandshake"  />
    <LandingCard  :count="4980" description="Active developers" :icon="Users "  />
    <LandingCard  :count="12430" description="Hours saved" :icon="Clock "  />
  </div>
	<!-- faq(?) -->
	<section class="max-w-7xl mx-auto px-8 py-12 flex flex-col gap-8">
		<Card class="border-primary/20 bg-primary/5">
			<CardContent class="flex items-start gap-4 py-2">
				<Info class="w-6 h-6 text-primary shrink-0 mt-1" />
				<div class="flex flex-col gap-1">
					<h3 class="text-lg font-semibold text-foreground">
						Not sure where to start?
					</h3>
					<p class="text-muted-foreground">
						Browse featured projects or read contributor tips to pick the right
						fit.
					</p>
				</div>
			</CardContent>
		</Card>
	</section>
	<!-- how it works -->
	<section class="max-w-7xl mx-auto px-8 py-12 flex gap-8 justify-between">
		<div class="flex-1">
			<div class="flex justify-between">
				<div>
					<h2 class="text-lg font-semibold text-foreground">For authors</h2>
					<p class="text-muted-foreground">
						Pass your project to someone who will finish it and credit it work.
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
							Create a project listing
						</h3>
						<p class="text-muted-foreground text-sm">
							Add repo, notes, goals, and a clear adoption checklist.
						</p>
					</div>
				</li>
				<li class="flex gap-6">
					<span class="text-xl font-bold font-mono text-primary">2</span>
					<div>
						<h3 class="font-semibold text-foreground">
							Set licensing & expectations
						</h3>
						<p class="text-muted-foreground text-sm">
							Choose a license and what support you can offer the adopter.
						</p>
					</div>
				</li>
				<li class="flex gap-6">
					<span class="text-xl font-bold font-mono text-primary">3</span>
					<div>
						<h3 class="font-semibold text-foreground">Approve adopters</h3>
						<p class="text-muted-foreground text-sm">
							Review candidates or let the ocmmunity pick the best fit.
						</p>
					</div>
				</li>
			</ul>
		</div>
		<div class="flex-1">
			<div class="flex justify-between">
				<div>
					<h2 class="text-lg font-semibold text-foreground">For adopters</h2>
					<p class="text-muted-foreground">
						Find an interesting codebase and continue the work with clear
						handoff notes.
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
						<h3 class="font-semibold text-foreground">Browse and filter</h3>
						<p class="text-muted-foreground text-sm">
							Search by tech stack, completeness, or project size.
						</p>
					</div>
				</li>
				<li class="flex gap-6">
					<span class="text-xl font-bold font-mono text-primary">2</span>
					<div>
						<h3 class="font-semibold text-foreground">Request adoption</h3>
						<p class="text-muted-foreground text-sm">
							Send a message and propose a plan to continue the project.
						</p>
					</div>
				</li>
				<li class="flex gap-6">
					<span class="text-xl font-bold font-mono text-primary">3</span>
					<div>
						<h3 class="font-semibold text-foreground">Complete & credit</h3>
						<p class="text-muted-foreground text-sm">
							Finish features, update docs, and credit the original author.
						</p>
					</div>
				</li>
			</ul>
		</div>
	</section>
</template>
