<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <p class="text-gray-600 dark:text-gray-400">Manage your application preferences</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Appearance -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Appearance</h2>
        
        <div class="space-y-6">
          <div>
            <label class="label">Theme</label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input
                  v-model="settings.theme"
                  type="radio"
                  value="light"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Light</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="settings.theme"
                  type="radio"
                  value="dark"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Dark</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="settings.theme"
                  type="radio"
                  value="system"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">System</span>
              </label>
            </div>
          </div>

          <div>
            <label class="label">Sidebar</label>
            <div class="flex items-center">
              <input
                v-model="settings.sidebarCollapsed"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Collapsed by default</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Notifications</h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Email notifications</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
            </div>
            <input
              v-model="settings.emailNotifications"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Push notifications</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Receive browser notifications</p>
            </div>
            <input
              v-model="settings.pushNotifications"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Task reminders</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Remind me about due tasks</p>
            </div>
            <input
              v-model="settings.taskReminders"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <!-- Privacy -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Privacy</h2>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Profile visibility</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Make your profile visible to team members</p>
            </div>
            <input
              v-model="settings.profileVisible"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">Activity tracking</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Track your activity for analytics</p>
            </div>
            <input
              v-model="settings.activityTracking"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      <!-- Data & Storage -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Data & Storage</h2>
        
        <div class="space-y-4">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white mb-2">Storage used</p>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div class="bg-primary-600 h-2 rounded-full" style="width: 25%"></div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">2.5 GB of 10 GB used</p>
          </div>

          <div class="space-y-2">
            <button
              @click="exportData"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Export my data
            </button>
            <button
              @click="clearCache"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Clear cache
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="mt-8 flex justify-end">
      <button
        @click="saveSettings"
        :disabled="isLoading"
        class="btn-primary"
      >
        <div v-if="isLoading" class="loading-spinner mr-2"></div>
        {{ isLoading ? 'Saving...' : 'Save Settings' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Settings',
  setup() {
    const store = useStore()

    const settings = ref({
      theme: 'system',
      sidebarCollapsed: false,
      emailNotifications: true,
      pushNotifications: false,
      taskReminders: true,
      profileVisible: true,
      activityTracking: true
    })

    const isLoading = computed(() => false) // Add loading state if needed

    const saveSettings = () => {
      // Save settings to localStorage or API
      localStorage.setItem('userSettings', JSON.stringify(settings.value))
      
      // Apply theme setting
      if (settings.value.theme === 'dark') {
        store.dispatch('ui/setDarkMode', true)
      } else if (settings.value.theme === 'light') {
        store.dispatch('ui/setDarkMode', false)
      }
      
      // Apply sidebar setting
      store.dispatch('ui/setSidebarCollapsed', settings.value.sidebarCollapsed)
    }

    const exportData = () => {
      // Implement data export
      console.log('Export data')
    }

    const clearCache = () => {
      // Clear application cache
      localStorage.removeItem('cache')
      console.log('Cache cleared')
    }

    onMounted(() => {
      // Load saved settings
      const savedSettings = localStorage.getItem('userSettings')
      if (savedSettings) {
        settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
      }
    })

    return {
      settings,
      isLoading,
      saveSettings,
      exportData,
      clearCache
    }
  }
}
</script>
