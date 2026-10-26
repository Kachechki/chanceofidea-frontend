<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '~/widgets/ui/card'
import { Button } from '~/widgets/ui/button'
import StatusBanner from '~/components/StatusBanner.vue'
import { getProjectFullName } from '~/lib/project'
import { applicationStage, stageCopy } from '~/lib/transfer'
import type { ApplicationEntity } from '~/types/application'

const props = defineProps<{
    application: ApplicationEntity
}>()

const emit = defineEmits<{
    confirm: []
    decline: []
}>()

const ownerLogin = computed(() => props.application.project?.owner?.login ?? 'unknown')
const repoName = computed(() =>
    props.application.project ? getProjectFullName(props.application.project) : ''
)

const stage = computed(() => applicationStage(props.application, 'applicant'))

const copy = computed(() =>
    stageCopy(stage.value, {
        viewer: 'applicant',
        applicantLogin: '',
        ownerLogin: ownerLogin.value,
    })
)

// the buttons only make sense while the transfer waits on the applicant
const needsAction = computed(() => stage.value === 'action-needed')
</script>

<template>
    <Card class="p-0">
        <CardContent class="p-5 flex flex-col gap-4">
            <div class="flex flex-col gap-1 min-w-0">
                <h3 class="font-bold text-lg text-foreground truncate">
                    {{ application.project?.title ?? 'Unknown project' }}
                </h3>
                <p class="text-xs font-mono text-muted-foreground break-all">{{ repoName }}</p>
                <p class="text-xs text-muted-foreground">From @{{ ownerLogin }}</p>
            </div>

            <StatusBanner
                :variant="copy.variant"
                :title="copy.title"
                :steps="copy.steps"
            />

            <div
                v-if="needsAction"
                class="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-border"
            >
                <Button
                    variant="ghost"
                    class="text-destructive hover:text-destructive hover:bg-destructive/10"
                    @click="emit('decline')"
                >
                    I do not want it
                </Button>
                <Button @click="emit('confirm')">
                    I have received it
                </Button>
            </div>
        </CardContent>
    </Card>
</template>
