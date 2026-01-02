<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ isEditing ? 'Edit Project' : 'Create New Project' }}
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
            <label class="label">Project Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="input"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label class="label">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="input"
              placeholder="Enter project description"
            ></textarea>
          </div>

          <div>
            <label class="label">Color</label>
            <div class="flex space-x-2">
              <button
                v-for="color in colors"
                :key="color"
                type="button"
                @click="form.color = color"
                :class="[
                  'w-8 h-8 rounded-full border-2',
                  form.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'
                ]"
                :style="{ backgroundColor: color }"
              ></button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              v-if="isEditing"
              type="button"
              @click="handleDelete"
              :disabled="isLoading"
              class="btn-outline text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            >
              Delete
            </button>
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
              {{ isLoading ? 'Saving...' : (isEditing ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { X } from 'lucide-vue-next'

export default {
  name: 'ProjectModal',
  components: {
    X
  },
  setup() {
    const store = useStore()

    const form = ref({
      name: '',
      description: '',
      color: '#3B82F6'
    })

    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#F97316', // Orange
      '#84CC16'  // Lime
    ]

    const isLoading = computed(() => store.getters['projects/isLoading'])
    const modalData = computed(() => store.getters['modals/modalData'])

    const isEditing = computed(() => !!modalData.value)

    const closeModal = () => {
      store.dispatch('modals/hideProjectModal')
      resetForm()
    }

    const resetForm = () => {
      form.value = {
        name: '',
        description: '',
        color: '#3B82F6'
      }
    }

    const handleSubmit = async () => {
      try {
        if (isEditing.value) {
          await store.dispatch('projects/updateProject', {
            projectId: modalData.value.id,
            projectData: form.value
          })
        } else {
          await store.dispatch('projects/createProject', form.value)
        }
        closeModal()
      } catch (error) {
        console.error('Project save error:', error)
        alert(error.response?.data?.error || 'Failed to save project')
      }
    }

    const handleDelete = async () => {
      if (!confirm(`Are you sure you want to delete "${modalData.value.name}"? This action cannot be undone.`)) {
        return
      }
      
      try {
        await store.dispatch('projects/deleteProject', modalData.value.id)
        closeModal()
      } catch (error) {
        console.error('Project delete error:', error)
        alert(error.response?.data?.error || 'Failed to delete project')
      }
    }

    onMounted(() => {
      if (isEditing.value) {
        form.value = { ...modalData.value }
      }
    })

    return {
      form,
      colors,
      isLoading,
      isEditing,
      closeModal,
      handleSubmit,
      handleDelete
    }
  }
}
</script>
