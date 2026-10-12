<template>
	<Card
		class="relative overflow-hidden bg-card border-muted-foreground/30 rounded-2xl transition-all hover:border-muted-foreground/60 p-0"
	>
		<!-- Optional Top Header Banner (for featured cards) -->
		<div
			v-if="bannerClass"
			:class="['h-12 w-full', bannerClass]"
		/>

		<CardContent class="p-6 flex flex-col gap-4">
			<!-- Title & Status Indicator -->
			<div class="flex items-start justify-between gap-4">
				<h3
					class="text-xl font-bold text-card-foreground tracking-tight truncate"
				>
					{{ project.title }}
				</h3>
				<div
					v-if="project.status"
					:class="[
						'w-4 h-4 rounded-full shrink-0 mt-1.5',
						getStatusColor(project.status),
					]"
					:title="`Status: ${project.status}`"
				/>
			</div>

			<!-- Description -->
			<p class="text-sm text-muted-foreground leading-relaxed line-clamp-2">
				{{ project.description }}
			</p>

			<!-- Tags & Actions Footer -->
			<div class="flex items-center justify-between gap-4 pt-2">
				<!-- Tech/Category Tags (mapped from TagEntity[]) -->
				<div class="flex flex-wrap items-center gap-1.5">
					<span
						v-for="tag in project.tags"
						:key="tag.id || tag"
						class="px-2.5 py-1 text-xs font-medium bg-accent text-secondary-foreground rounded-md"
					>
						{{
							typeof tag === 'object' && tag !== null ? (tag as any).name : tag
						}}
					</span>
				</div>

				<!-- Action Buttons -->
				<div class="flex items-center gap-1 text-muted-foreground">
					<button
						type="button"
						class="p-1.5 hover:text-foreground transition-colors rounded-md hover:bg-accent cursor-pointer"
						@click="$emit('bookmark', project)"
						aria-label="Bookmark repository"
					>
						<Bookmark
							class="w-4 h-4"
							:class="{ 'fill-current text-primary': isBookmarked }"
						/>
					</button>

					<a
						v-if="project.repostoryUrl"
						:href="project.repostoryUrl"
						target="_blank"
						rel="noopener noreferrer"
						class="p-1.5 hover:text-foreground transition-colors rounded-md hover:bg-accent cursor-pointer inline-flex items-center justify-center"
						aria-label="Open repository link"
						@click="$emit('external', project)"
					>
						<ExternalLink class="w-4 h-4" />
					</a>
					<button
						v-else
						type="button"
						class="p-1.5 hover:text-foreground transition-colors rounded-md hover:bg-accent cursor-pointer"
						@click="$emit('external', project)"
						aria-label="Open repository link"
					>
						<ExternalLink class="w-4 h-4" />
					</button>
				</div>
			</div>
		</CardContent>
	</Card>
</template>
<script setup lang="ts">
import { Bookmark, ExternalLink } from '@lucide/vue'
import { Card, CardContent } from '~/widgets/ui/card'
import { type ProjectEntity, ProjectStatusEnum } from '~/types/project'

interface Props {
	project: ProjectEntity
	bannerClass?: string // Optional top banner styling for featured cards (like the 4th Figma variant)
	isBookmarked?: boolean
}

withDefaults(defineProps<Props>(), {
	bannerClass: '',
	isBookmarked: false,
})

defineEmits<{
	(e: 'bookmark', project: ProjectEntity): void
	(e: 'external', project: ProjectEntity): void
}>()

// Map TypeORM status enum to Tailwind background colors for the status dot
const getStatusColor = (status: ProjectStatusEnum | string) => {
	switch (status) {
		case ProjectStatusEnum.DRAFT:
		case 'DRAFT':
			return 'bg-gray-500'
		case ProjectStatusEnum.PUBLISHED:
		case 'PUBLISHED':
			return 'bg-emerald-500'
		case ProjectStatusEnum.TRANSFERRING:
		case 'TRANSFERRING':
			return 'bg-amber-400'
		case ProjectStatusEnum.ADOPTED:
		case 'ADOPTED':
			return 'bg-blue-500'
		default:
			return 'bg-emerald-500'
	}
}
</script>
