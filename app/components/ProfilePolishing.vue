<template>
  <div class="max-w-5xl mx-auto space-y-8 p-6">
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
      <div class="w-24 h-24 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
        <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="Avatar" class="w-full h-full object-cover" />
      </div>
      <div class="flex-1 text-center md:text-left space-y-2">
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">developer_username</h1>
        <p class="text-sm text-zinc-600 dark:text-zinc-400">Full-stack developer passionate about open source and reviving abandoned projects.</p>
        <div class="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
          <span>GitHub: @developer</span>
          <span>Twitter: @dev</span>
          <span>Website: https://dev.io</span>
        </div>
      </div>
      <div class="flex gap-3">
        <div class="bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-lg text-center">
          <p class="text-lg font-bold text-zinc-900 dark:text-zinc-100">5</p>
          <p class="text-xs text-zinc-500">Created</p>
        </div>
        <div class="bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-lg text-center">
          <p class="text-lg font-bold text-zinc-900 dark:text-zinc-100">2</p>
          <p class="text-xs text-zinc-500">Adopted</p>
        </div>
      </div>
    </div>

    <div class="border-b border-zinc-200 dark:border-zinc-800 flex gap-6">
      <button class="pb-3 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400">Created Projects</button>
      <button class="pb-3 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">Adopted Projects</button>
      <button class="pb-3 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">Requests</button>
      <button class="pb-3 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">Favorites</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
        <div class="flex justify-between items-start">
          <h3 class="font-semibold text-zinc-900 dark:text-zinc-100">Sample Project Title</h3>
          <span class="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">Draft</span>
        </div>
        <p class="text-sm text-zinc-600 dark:text-zinc-400">Short project pitch describing the core idea and main goals.</p>
        <div class="flex justify-end gap-2 pt-2">
          <button class="px-3 py-1.5 text-xs font-medium border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300">Edit</button>
          <button class="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Publish</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>