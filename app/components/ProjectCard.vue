<template>
	<article class="relative">
		<Card
			class="relative overflow-hidden bg-card border-muted-foreground/30 rounded-2xl transition-all hover:border-muted-foreground/60 p-0 focus-within:ring-3 focus-within:ring-ring/50"
		>
			<div
				v-if="bannerClass"
				:class="['h-12 w-full', bannerClass]"
				aria-hidden="true"
			/>

			<CardContent class="p-6 flex flex-col gap-4">
				<div class="flex items-start justify-between gap-4">
					<div class="min-w-0">
						<h3
							class="text-xl font-bold text-card-foreground tracking-tight truncate"
						>
							<!-- Stretched link: the ::after covers the whole card -->
							<NuxtLink
								:to="`/projects/${project.id}`"
								class="after:absolute after:inset-0 focus:outline-none"
							>
								{{ project.title }}
							</NuxtLink>
						</h3>
						<p class="text-xs font-mono text-muted-foreground truncate">
							{{ fullName }}
						</p>
					</div>
					<span
						v-if="project.status"
						:class="[
							'w-4 h-4 rounded-full shrink-0 mt-1.5',
							getStatusColor(project.status),
						]"
						role="img"
						:aria-label="`Status: ${project.status}`"
						:title="`Status: ${project.status}`"
					/>
				</div>

				<p class="text-sm text-muted-foreground leading-relaxed line-clamp-2">
					{{ project.description }}
				</p>

				<div class="flex items-center justify-between gap-4 pt-2">
					<ul class="flex flex-wrap items-center gap-1.5" aria-label="Tags">
						<li
							v-for="tag in project.tags"
							:key="tag.id"
							class="px-2.5 py-1 text-xs font-medium bg-accent text-secondary-foreground rounded-md"
						>
							{{ tag.name }}
						</li>
					</ul>

					<!-- Action buttons sit above the stretched link -->
					<div class="relative z-10 flex items-center gap-1 text-muted-foreground">
						<button
							type="button"
							class="p-1.5 hover:text-foreground transition-colors rounded-md hover:bg-accent cursor-pointer"
							:aria-pressed="bookmarked"
							:aria-label="bookmarked ? `Remove ${project.title} from bookmarks` : `Add ${project.title} to bookmarks`"
							@click="onBookmark"
						>
							<Bookmark
								class="w-4 h-4"
								aria-hidden="true"
								:class="{ 'fill-current text-primary': bookmarked }"
							/>
						</button>

						<a
							:href="repoUrl"
							target="_blank"
							rel="noopener noreferrer"
							class="p-1.5 hover:text-foreground transition-colors rounded-md hover:bg-accent cursor-pointer inline-flex items-center justify-center"
							:aria-label="`Open ${project.title} repository on GitHub (opens in a new tab)`"
							@click="$emit('external', project)"
						>
							<ExternalLink class="w-4 h-4" aria-hidden="true" />
						</a>
					</div>
				</div>
			</CardContent>
		</Card>
	</article>
</template>
<script setup lang="ts">
import { Bookmark, ExternalLink } from '@lucide/vue'
import { Card, CardContent } from '~/widgets/ui/card'
import { type ProjectEntity, ProjectStatusEnum } from '~/types/project'
import { getProjectFullName, getProjectRepoUrl } from '~/lib/project'
import { useBookmarksStore } from '~/stores/bookmarksStore'

interface Props {
	project: ProjectEntity
	bannerClass?: string // Optional top banner styling for featured cards (like the 4th Figma variant)
}

const props = withDefaults(defineProps<Props>(), {
	bannerClass: '',
})

const fullName = computed(() => getProjectFullName(props.project))
const repoUrl = computed(() => getProjectRepoUrl(props.project))

const bookmarks = useBookmarksStore()
const bookmarked = computed(() => bookmarks.isBookmarked(props.project.id))

// signed-out users are sent to log in instead
const onBookmark = () => {
	if (!bookmarks.toggle(props.project)) navigateTo('/login')
}

defineEmits<{
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
