<template>
  <div class="p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Calendar 📅
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        View your tasks and projects in calendar format.
      </p>
    </div>

    <div class="card p-6">
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Calendar class="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Calendar View</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          This feature is coming soon! You'll be able to view your tasks and deadlines in a beautiful calendar interface.
        </p>
        <div class="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <p>• Monthly, weekly, and daily views</p>
          <p>• Drag and drop task scheduling</p>
          <p>• Deadline reminders and notifications</p>
          <p>• Integration with project timelines</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Calendar } from 'lucide-vue-next'

export default {
  name: 'Calendar',
  components: {
    Calendar
  }
}
</script>
