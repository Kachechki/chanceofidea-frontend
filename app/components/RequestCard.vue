<script setup lang="ts">
import { Card, CardContent } from '~/widgets/ui/card'
import { Button } from '~/widgets/ui/button'
import type { StageCopy } from '~/lib/transfer'
import StatusBanner from '~/components/StatusBanner.vue'

export interface AdoptionRequestEntity {
    // next-step banner, set for every request past the pending step
    transfer?: StageCopy
    id: string
    createdAt: string
    status: 'Pending' | 'Accepted' | 'Rejected' | string
    whyMe: string
    actionPlan: string
    portfolioUrl: string
    // full repo name, set on incoming requests only
    repoName?: string
    applicant: {
        id: string
        name: string
        avatar?: string
    }
}

const props = defineProps<{
    request: AdoptionRequestEntity
    isAuthorView?: boolean
}>()

defineEmits<{
    (e: 'accept', id: string): void
    (e: 'reject', id: string): void
}>()

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'Accepted':
            return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        case 'Rejected':
            return 'bg-destructive/10 text-destructive border-destructive/20'
        default:
            return 'bg-amber-400/10 text-amber-500 border-amber-400/20'
    }
}
</script>

<template>
    <Card class="relative overflow-hidden bg-card border-muted-foreground/30 rounded-2xl p-0">
        <CardContent class="p-6 flex flex-col gap-4">
            <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <img
                        :src="request.applicant.avatar || 'https://github.githubassets.com/favicons/favicon.svg'"
                        alt=""
                        class="w-10 h-10 rounded-full object-cover bg-secondary border border-border"
                    />
                    <div class="flex flex-col">
                        <span class="font-semibold text-sm text-foreground">{{ request.applicant.name }}</span>
                        <span v-if="request.repoName" class="text-xs text-primary font-mono break-all">{{ request.repoName }}</span>
                        <span class="text-xs text-muted-foreground font-mono">Submitted: {{ request.createdAt }}</span>
                    </div>
                </div>

                <span
                    class="px-2.5 py-1 text-xs font-mono font-medium rounded-md border"
                    :class="getStatusBadgeClass(request.status)"
                >
                    {{ request.status }}
                </span>
            </div>

            <StatusBanner
                v-if="request.transfer"
                :variant="request.transfer.variant"
                :title="request.transfer.title"
                :steps="request.transfer.steps"
            />

            <div class="flex flex-col gap-3 text-sm">
                <div>
                    <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Why you?</span>
                    <p class="mt-1 text-foreground leading-relaxed">{{ request.whyMe }}</p>
                </div>

                <div>
                    <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action plan (2-4 weeks)</span>
                    <p class="mt-1 text-foreground leading-relaxed">{{ request.actionPlan }}</p>
                </div>

                <div v-if="request.portfolioUrl">
                    <a
                        :href="request.portfolioUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                    >
                        <span aria-hidden="true">🔗</span> GitHub / Portfolio link
                        <span class="sr-only">(opens in a new tab)</span>
                    </a>
                </div>
            </div>

            <div v-if="isAuthorView && request.status === 'Pending'" class="flex items-center gap-2 pt-3 border-t border-border">
                <Button size="sm" class="bg-emerald-600 hover:bg-emerald-700 text-white" @click="$emit('accept', request.id)">
                    Accept
                </Button>
                <Button size="sm" variant="destructive" @click="$emit('reject', request.id)">
                    Reject
                </Button>
            </div>
        </CardContent>
    </Card>
</template>