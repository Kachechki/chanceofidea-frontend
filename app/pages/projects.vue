<template>
	<div class="w-full flex flex-col gap-8 justify-center items-center p-8">
		<div class="w-full max-w-96">
			<div class="flex gap-2 items-center">
				<Search class="text-muted-foreground!" />
				<Input
					v-model="searchQuery"
					placeholder="Search projects..."
					class="border-muted-foreground/30!"
					size="lg"
				></Input>
			</div>
		</div>
		<div class="grid grid-cols-3 gap-4">
			<ProjectCard
				v-for="project in filteredProjects"
				:project="project"
			/>
		</div>
	</div>
</template>
<script setup lang="ts">
import { Input } from '~/components/ui/input'
import { type ProjectEntity, ProjectStatusEnum } from '~/types/project'
import { Search } from '@lucide/vue'

const searchQuery = ref('')
const projects = ref<ProjectEntity[]>([
	{
		id: 'uuid-proj-001',
		title: 'ai-code-reviewer/bot',
		status: ProjectStatusEnum.PUBLISHED,
		readiness: 0.85,
		description:
			'An automated GitHub bot that performs deep AST parsing and AI-assisted security reviews on pull requests.',
		repositoryId: 1049281,
		repostoryUrl: 'https://github.com/ai-code-reviewer/bot',
		createdAt: new Date('2026-01-15T10:00:00Z'),
		owner: {} as any,
		category: { id: 'cat-1', name: 'Developer Tools' } as any,
		tags: [
			{ id: 'tag-1', name: 'ai' },
			{ id: 'tag-2', name: 'backend' },
			{ id: 'tag-3', name: 'cybersec' },
			{ id: 'tag-4', name: 'free' },
		],
	},
	{
		id: 'uuid-proj-002',
		title: 'nuxt/seo-toolkit',
		status: ProjectStatusEnum.TRANSFERRING,
		readiness: 0.6,
		description:
			'Lightweight meta tag and OpenGraph inspector plugin built explicitly for Nuxt 4 architecture.',
		repositoryId: 2938471,
		repostoryUrl: 'https://github.com/nuxt-contrib/seo-toolkit',
		createdAt: new Date('2026-02-10T14:30:00Z'),
		owner: {} as any,
		category: { id: 'cat-2', name: 'Web Development' } as any,
		tags: [
			{ id: 'tag-5', name: 'vue' },
			{ id: 'tag-6', name: 'frontend' },
			{ id: 'tag-4', name: 'free' },
		],
	},
	{
		id: 'uuid-proj-003',
		title: 'cyber/packet-sniffer',
		status: ProjectStatusEnum.ADOPTED,
		readiness: 0.95,
		description:
			'Real-time network traffic analyzer and anomalous packet logger written with high-performance C bindings.',
		repositoryId: 3849102,
		repostoryUrl: 'https://github.com/cyber/packet-sniffer',
		createdAt: new Date('2025-11-05T09:15:00Z'),
		owner: {} as any,
		category: { id: 'cat-3', name: 'Networking' } as any,
		tags: [
			{ id: 'tag-3', name: 'cybersec' },
			{ id: 'tag-7', name: 'systems' },
			{ id: 'tag-8', name: 'c++' },
		],
	},
	{
		id: 'uuid-proj-004',
		title: 'retro/walkman-firmware',
		status: ProjectStatusEnum.PUBLISHED,
		readiness: 0.4,
		description:
			'Open-source custom firmware patch for digital portable cassette players and vintage audio gear restoration.',
		repositoryId: 4958201,
		repostoryUrl: 'https://github.com/retro/walkman-firmware',
		createdAt: new Date('2026-03-01T18:45:00Z'),
		owner: {} as any,
		category: { id: 'cat-4', name: 'Embedded Systems' } as any,
		tags: [
			{ id: 'tag-9', name: 'hardware' },
			{ id: 'tag-10', name: 'c' },
			{ id: 'tag-4', name: 'free' },
		],
	},
	{
		id: 'uuid-proj-005',
		title: 'logistics/factory-planner',
		status: ProjectStatusEnum.TRANSFERRING,
		readiness: 0.7,
		description:
			'Isometric calculator and throughput dependency graph visualizer for complex industrial factory simulation games.',
		repositoryId: 5019283,
		repostoryUrl: 'https://github.com/logistics/factory-planner',
		createdAt: new Date('2026-03-20T11:20:00Z'),
		owner: {} as any,
		category: { id: 'cat-5', name: 'Gaming' } as any,
		tags: [
			{ id: 'tag-5', name: 'vue' },
			{ id: 'tag-11', name: 'simulation' },
			{ id: 'tag-12', name: 'algorithms' },
		],
	},
	{
		id: 'uuid-proj-006',
		title: 'db/postgres-shard-router',
		status: ProjectStatusEnum.PUBLISHED,
		readiness: 0.8,
		description:
			'Transparent query routing proxy and automated horizontal sharding manager for distributed PostgreSQL clusters.',
		repositoryId: 6102938,
		repostoryUrl: 'https://github.com/db/postgres-shard-router',
		createdAt: new Date('2026-01-28T16:00:00Z'),
		owner: {} as any,
		category: { id: 'cat-6', name: 'Databases' } as any,
		tags: [
			{ id: 'tag-2', name: 'backend' },
			{ id: 'tag-13', name: 'database' },
			{ id: 'tag-14', name: 'typescript' },
		],
	},
	{
		id: 'uuid-proj-007',
		title: 'ui/acid-design-system',
		status: ProjectStatusEnum.ADOPTED,
		readiness: 0.9,
		description:
			'Brutalist aesthetic component kit featuring high-contrast brutalism, vectorheart motifs, and FUI elements.',
		repositoryId: 7210394,
		repostoryUrl: 'https://github.com/ui/acid-design-system',
		createdAt: new Date('2025-12-12T08:30:00Z'),
		owner: {} as any,
		category: { id: 'cat-2', name: 'Web Development' } as any,
		tags: [
			{ id: 'tag-6', name: 'frontend' },
			{ id: 'tag-15', name: 'design' },
			{ id: 'tag-4', name: 'free' },
		],
	},
	{
		id: 'uuid-proj-008',
		title: 'discord/roblox-mappertracker',
		status: ProjectStatusEnum.PUBLISHED,
		readiness: 0.5,
		description:
			'Automated monitoring bot that tracks environmental day-night cycles and coordinate mappings for sandbox multiplayer servers.',
		repositoryId: 8321049,
		repostoryUrl: 'https://github.com/discord/roblox-mappertracker',
		createdAt: new Date('2026-04-02T12:10:00Z'),
		owner: {} as any,
		category: { id: 'cat-7', name: 'Community Bots' } as any,
		tags: [
			{ id: 'tag-2', name: 'backend' },
			{ id: 'tag-16', name: 'bot' },
			{ id: 'tag-17', name: 'lua' },
		],
	},
	{
		id: 'uuid-proj-009',
		title: 'browser/moodle-progress-sync',
		status: ProjectStatusEnum.ADOPTED,
		readiness: 1.0,
		description:
			'Chromium and Firefox extension that aggregates lesson completion metrics and semester grade points cleanly.',
		repositoryId: 9432105,
		repostoryUrl: 'https://github.com/browser/moodle-progress-sync',
		createdAt: new Date('2026-05-15T07:50:00Z'),
		owner: {} as any,
		category: { id: 'cat-8', name: 'Browser Extensions' } as any,
		tags: [
			{ id: 'tag-6', name: 'frontend' },
			{ id: 'tag-18', name: 'extension' },
			{ id: 'tag-4', name: 'free' },
		],
	},
	{
		id: 'uuid-proj-010',
		title: 'audio/complextro-synthesizer',
		status: ProjectStatusEnum.TRANSFERRING,
		readiness: 0.35,
		description:
			'WebAssembly-powered software synthesizer plugin tailored for high-tempo complextro bass modulation chains.',
		repositoryId: 1054321,
		repostoryUrl: 'https://github.com/audio/complextro-synthesizer',
		createdAt: new Date('2026-06-08T22:00:00Z'),
		owner: {} as any,
		category: { id: 'cat-9', name: 'Audio Engineering' } as any,
		tags: [
			{ id: 'tag-19', name: 'audio' },
			{ id: 'tag-20', name: 'wasm' },
			{ id: 'tag-7', name: 'systems' },
		],
	},
])

// TODO: add debounce/rate-limiting so the db wont be spammed with requests for every character
const filteredProjects = computed(() => {
	if (!searchQuery.value.trim()) return projects.value

	const query = searchQuery.value.toLowerCase().trim()

	return projects.value.filter((project) => {
		const matchesTitle = project.title.toLowerCase().includes(query)
		const matchesDescription = project.description.toLowerCase().includes(query)
		const matchesTags = project.tags.some((tag) =>
			tag.name.toLowerCase().includes(query)
		)

		return matchesTitle || matchesDescription || matchesTags
	})
})
</script>
<style scoped lang="css"></style>
