<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
      <p class="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Information -->
      <div class="lg:col-span-2">
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h2>
          
          <form @submit.prevent="updateProfile" class="space-y-6">
            <div class="flex items-center space-x-6">
              <div class="flex-shrink-0">
                <img
                  :src="user?.avatar || defaultAvatar"
                  :alt="user?.name"
                  class="h-20 w-20 rounded-full"
                />
              </div>
              <div>
                <button
                  type="button"
                  class="btn-outline btn-sm"
                >
                  Change Avatar
                </button>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="label">Full Name</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="input"
                />
              </div>
              <div>
                <label class="label">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  disabled
                  class="input bg-gray-100 dark:bg-gray-700"
                />
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="isLoading"
                class="btn-primary"
              >
                <div v-if="isLoading" class="loading-spinner mr-2"></div>
                {{ isLoading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Account Stats -->
      <div class="space-y-6">
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Stats</h3>
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Member since</span>
              <span class="text-gray-900 dark:text-white">{{ formatDate(user?.created_at) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Projects</span>
              <span class="text-gray-900 dark:text-white">{{ stats.projectsCount || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Tasks completed</span>
              <span class="text-gray-900 dark:text-white">{{ stats.completedTasks || 0 }}</span>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button
              @click="changePassword"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Change Password
            </button>
            <button
              @click="exportData"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              Export Data
            </button>
            <button
              @click="deleteAccount"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Profile',
  setup() {
    const store = useStore()

    const form = ref({
      name: '',
      email: '',
      avatar: ''
    })

    const user = computed(() => store.getters['auth/user'])
    const isLoading = computed(() => store.getters['auth/isLoading'])

    const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'

    const stats = ref({
      projectsCount: 0,
      completedTasks: 0
    })

    const updateProfile = async () => {
      try {
        await store.dispatch('auth/updateProfile', form.value)
      } catch (error) {
        console.error('Profile update error:', error)
      }
    }

    const changePassword = () => {
      // Implement password change modal
      console.log('Change password')
    }

    const exportData = () => {
      // Implement data export
      console.log('Export data')
    }

    const deleteAccount = () => {
      if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // Implement account deletion
        console.log('Delete account')
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    }

    onMounted(() => {
      if (user.value) {
        form.value = {
          name: user.value.name,
          email: user.value.email,
          avatar: user.value.avatar
        }
      }
    })

    return {
      form,
      user,
      isLoading,
      defaultAvatar,
      stats,
      updateProfile,
      changePassword,
      exportData,
      deleteAccount,
      formatDate
    }
  }
}
</script>
