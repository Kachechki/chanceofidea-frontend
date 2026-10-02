<script setup lang="ts">
import Header from "~/widgets/Header.vue";
import {Button} from "~/widgets/ui/button";
import {Clock, FileBox, HeartHandshake, Package, Users} from '@lucide/vue';
import { Info } from '@lucide/vue';
import {Card, CardContent} from "~/widgets/ui/card";
import LandingCard from "~/widgets/LandingCard.vue";
</script>

<template>
  <Header />
  <section class="relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div class="flex flex-col gap-6">
        <h1 class="text-5xl font-bold text-foreground leading-tight">
          Give your unfinished side project a second life
        </h1>
        <span class="text-lg text-muted-foreground leading-relaxed max-w-xl">
          Second Chance Archive connects developers who want to pass on abandoned or unfinished projects with adopters ready to continue the work — preserving ideas and saving development time.
        </span>
        <div class="flex items-center gap-4 mt-2">
          <Button size="lg" class="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <FileBox class="w-5 h-5" />
            Publish project
          </Button>
          <Button size="lg" variant="outline" class="border-input text-foreground hover:bg-accent hover:text-accent-foreground">
            Find a project
          </Button>
        </div>
      </div>
      <div class="relative flex justify-center lg:justify-end">
        <div class="w-full max-w-md aspect-square rounded-2xl bg-secondary/50 flex items-center justify-center">
          <FileBox class="w-32 h-32 text-primary opacity-40" stroke-width="1" />
        </div>
      </div>
    </div>
  </section>
  <div class="max-w-7xl mx-auto px-8 py-12 flex flex-col gap-8">
    <Card class="border-primary/20 bg-primary/5">
      <CardContent class="flex items-start gap-4 py-2">
        <Info class="w-6 h-6 text-primary shrink-0 mt-1" />
        <div class="flex flex-col gap-1">
          <h3 class="text-lg font-semibold text-foreground">Not sure where to start?</h3>
          <p class="text-muted-foreground">
            Browse featured projects or read contributor tips to pick the right fit.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
  <div class="grid grid-rows-1 gap-6 grid-cols-4 gap-8 m-8">
    <LandingCard  :count="3842" description="Total projects" :icon="Package"  />
    <LandingCard  :count="1255" description="Adopted projects" :icon="HeartHandshake"  />
    <LandingCard  :count="4980" description="Active developers" :icon="Users "  />
    <LandingCard  :count="12430" description="Hours saved" :icon="Clock "  />
  </div>
</template>