<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ isEditing ? 'Edit User' : 'Add Team Member' }}
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="label">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="input"
              placeholder="Enter user email"
            />
          </div>

          <div>
            <label class="label">Role</label>
            <select v-model="form.role" required class="input">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="btn-primary"
            >
              <div v-if="isLoading" class="loading-spinner mr-2"></div>
              {{ isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Add') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { X } from 'lucide-vue-next'

export default {
  name: 'UserModal',
  components: {
    X
  },
  setup() {
    const store = useStore()

    const form = ref({
      email: '',
      role: 'member'
    })

    const isLoading = computed(() => store.getters['projects/isLoading'])
    const modalData = computed(() => store.getters['modals/modalData'])

    const isEditing = computed(() => !!modalData.value && !modalData.value.projectId)
    
    // Watch for modal close to reload project
    watch(() => store.getters['modals/showUserModal'], (isOpen) => {
      if (!isOpen && modalData.value?.projectId) {
        // Modal was closed, reload project if we have a projectId
        store.dispatch('projects/fetchProject', modalData.value.projectId)
      }
    })

    const closeModal = () => {
      store.dispatch('modals/hideUserModal')
      resetForm()
    }

    const resetForm = () => {
      form.value = {
        email: '',
        role: 'member'
      }
    }

    const handleSubmit = async () => {
      try {
        const projectId = modalData.value?.projectId
        if (!projectId) {
          alert('No project ID provided')
          return
        }

        if (isEditing.value) {
          // Update user role logic here (if needed in future)
          console.log('Update user role:', form.value)
        } else {
          // Add member to project
          await store.dispatch('projects/addMember', {
            projectId,
            memberData: {
              email: form.value.email,
              role: form.value.role
            }
          })
          // Reload project to get updated member list
          await store.dispatch('projects/fetchProject', projectId)
        }
        closeModal()
      } catch (error) {
        console.error('User save error:', error)
        const errorMessage = error.response?.data?.error || 'Failed to add member'
        alert(errorMessage)
        throw error
      }
    }

    onMounted(() => {
      if (isEditing.value) {
        form.value = { ...modalData.value }
      }
    })

    return {
      form,
      isLoading,
      isEditing,
      closeModal,
      handleSubmit
    }
  }
}
</script>
