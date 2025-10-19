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
              <div class="flex-shrink-0 relative">
                <img
                  :src="user?.avatar || defaultAvatar"
                  :alt="user?.name"
                  class="h-20 w-20 rounded-full object-cover"
                />
                <div v-if="isUploading" class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div class="loading-spinner"></div>
                </div>
              </div>
              <div>
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  @change="handleAvatarUpload"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="$refs.avatarInput.click()"
                  :disabled="isUploading"
                  class="btn-outline btn-sm disabled:opacity-50"
                >
                  <div v-if="isUploading" class="loading-spinner mr-2"></div>
                  {{ isUploading ? 'Uploading...' : 'Change Avatar' }}
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
              :disabled="isExporting"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 flex items-center"
            >
              <div v-if="isExporting" class="loading-spinner mr-2"></div>
              {{ isExporting ? 'Exporting...' : 'Export Data' }}
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

    <!-- Change Password Modal -->
    <ChangePasswordModal v-if="showChangePasswordModal" @close="showChangePasswordModal = false" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import ChangePasswordModal from '../components/Modals/ChangePasswordModal.vue'

const toast = useToast()

export default {
  name: 'Profile',
  components: {
    ChangePasswordModal
  },
  setup() {
    const store = useStore()

    const form = ref({
      name: '',
      email: '',
      avatar: ''
    })

    const isUploading = ref(false)
    const isExporting = ref(false)
    const showChangePasswordModal = ref(false)

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

    const handleAvatarUpload = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      isUploading.value = true

      try {
        // Simulate avatar upload (in demo mode)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Create a preview URL
        const avatarUrl = URL.createObjectURL(file)
        
        // Update the form with the new avatar
        form.value.avatar = avatarUrl
        
        // Update the user profile
        await store.dispatch('auth/updateProfile', { avatar: avatarUrl })
        
        // Clear the file input
        event.target.value = ''
      } catch (error) {
        console.error('Avatar upload error:', error)
        alert('Failed to upload avatar. Please try again.')
      } finally {
        isUploading.value = false
      }
    }

    const changePassword = () => {
      showChangePasswordModal.value = true
    }

    const exportData = async () => {
      try {
        // Show loading state
        isExporting.value = true
        
        // Simulate data export
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Create and download export file
        const exportData = {
          user: user.value,
          projects: [], // Would fetch from store
          tasks: [], // Would fetch from store
          settings: {
            darkMode: store.getters['ui/darkMode'],
            notifications: store.getters['ui/notifications']
          },
          exportDate: new Date().toISOString()
        }
        
        const dataStr = JSON.stringify(exportData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `taskflow-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        toast.success('Data exported successfully!')
      } catch (error) {
        console.error('Export error:', error)
        toast.error('Failed to export data. Please try again.')
      } finally {
        isExporting.value = false
      }
    }

    const deleteAccount = async () => {
      if (confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.')) {
        try {
          const result = await store.dispatch('auth/deleteAccount')
          if (result.success) {
            // User will be redirected to login by the auth store
          }
        } catch (error) {
          console.error('Delete account error:', error)
        }
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
      isUploading,
      isExporting,
      showChangePasswordModal,
      user,
      isLoading,
      defaultAvatar,
      stats,
      updateProfile,
      handleAvatarUpload,
      changePassword,
      exportData,
      deleteAccount,
      formatDate
    }
  }
}
</script>
