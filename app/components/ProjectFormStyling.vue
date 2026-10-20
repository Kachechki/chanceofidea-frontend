<template>
  <div class="max-w-3xl mx-auto space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Project Details</h2>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">Fill in the core information about your abandoned project.</p>
    </div>

    <div class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Project Title</label>
        <input
          type="text"
          placeholder="e.g. Decentralized Task Tracker"
          class="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Pitch (max 140 characters)</label>
        <input
          type="text"
          maxlength="140"
          placeholder="A short one-liner description..."
          class="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Transfer Terms</label>
        <select
          class="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="mit">MIT License / Full Ownership</option>
          <option value="partial">Collaborative Handover</option>
          <option value="donation">As-is Free Donation</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>