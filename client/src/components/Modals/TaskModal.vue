<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ isEditing ? 'Edit Task' : 'Create New Task' }}
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
            <label class="label">Title</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="input"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label class="label">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="input"
              placeholder="Enter task description"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Priority</label>
              <select v-model="form.priority" class="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label class="label">Status</label>
              <select v-model="form.status" class="input">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label class="label">Project</label>
            <select v-model="form.project_id" required class="input">
              <option value="">Select a project</option>
              <option
                v-for="project in projects"
                :key="project.id"
                :value="project.id"
              >
                {{ project.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="label">Assign to</label>
            <select v-model="form.assignee_id" class="input">
              <option value="">Unassigned</option>
              <option
                v-for="user in users"
                :key="user.id"
                :value="user.id"
              >
                {{ user.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="label">Due Date</label>
            <input
              v-model="form.due_date"
              type="datetime-local"
              class="input"
            />
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
  name: 'TaskModal',
  components: {
    X
  },
  setup() {
    const store = useStore()

    const form = ref({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      project_id: '',
      assignee_id: '',
      due_date: ''
    })

    const isLoading = computed(() => store.getters['tasks/isLoading'])
    const projects = computed(() => store.getters['projects/projects'])
    const users = computed(() => store.getters['users/users'])
    const modalData = computed(() => store.getters['modals/modalData'])

    const isEditing = computed(() => !!modalData.value)

    const closeModal = () => {
      store.dispatch('modals/hideTaskModal')
      resetForm()
    }

    const resetForm = () => {
      form.value = {
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        project_id: '',
        assignee_id: '',
        due_date: ''
      }
    }

    const handleSubmit = async () => {
      try {
        if (isEditing.value) {
          await store.dispatch('tasks/updateTask', {
            taskId: modalData.value.id,
            taskData: form.value
          })
        } else {
          await store.dispatch('tasks/createTask', form.value)
        }
        closeModal()
      } catch (error) {
        console.error('Task save error:', error)
      }
    }

    const loadData = async () => {
      if (projects.value.length === 0) {
        await store.dispatch('projects/fetchProjects')
      }
      if (users.value.length === 0) {
        await store.dispatch('users/fetchUsers')
      }
    }

    onMounted(() => {
      loadData()
      
      if (isEditing.value) {
        form.value = { ...modalData.value }
      }
    })

    return {
      form,
      isLoading,
      projects,
      users,
      isEditing,
      closeModal,
      handleSubmit
    }
  }
}
</script>
