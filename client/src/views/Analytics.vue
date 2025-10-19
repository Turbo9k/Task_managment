<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Analytics 📊
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Track your productivity and project performance with detailed analytics.
      </p>
    </div>

    <div class="card p-6">
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900 dark:to-accent-800 rounded-xl flex items-center justify-center mx-auto mb-4">
          <BarChart3 class="h-8 w-8 text-accent-600 dark:text-accent-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Analytics Dashboard</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          This feature is coming soon! Get insights into your productivity patterns and project performance.
        </p>
        <div class="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <p>• Task completion trends and patterns</p>
          <p>• Project progress tracking</p>
          <p>• Team productivity metrics</p>
          <p>• Time tracking and efficiency reports</p>
          <p>• Custom charts and visualizations</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { BarChart3 } from 'lucide-vue-next'

export default {
  name: 'Analytics',
  components: {
    BarChart3
  }
}
</script>
