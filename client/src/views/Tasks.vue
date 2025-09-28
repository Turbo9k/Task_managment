<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage and track your tasks</p>
      </div>
      <button
        @click="createTask"
        class="btn-primary"
      >
        <Plus class="h-4 w-4 mr-2" />
        New Task
      </button>
    </div>

    <!-- Filters -->
    <div class="card p-4 mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-64">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tasks..."
            class="input"
            @input="handleSearch"
          />
        </div>
        <select v-model="statusFilter" @change="handleFilter" class="input w-40">
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select v-model="priorityFilter" @change="handleFilter" class="input w-40">
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <button
          @click="clearFilters"
          class="btn-outline btn-sm"
        >
          Clear
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="card p-4">
        <div class="skeleton h-4 w-3/4 mb-2"></div>
        <div class="skeleton h-3 w-1/2"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTasks.length === 0" class="text-center py-12">
      <CheckSquare class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ searchQuery || statusFilter || priorityFilter ? 'No tasks found' : 'No tasks yet' }}
      </h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        {{ searchQuery || statusFilter || priorityFilter ? 'Try adjusting your filters' : 'Get started by creating your first task.' }}
      </p>
      <button
        v-if="!searchQuery && !statusFilter && !priorityFilter"
        @click="createTask"
        class="btn-primary"
      >
        <Plus class="h-4 w-4 mr-2" />
        Create Task
      </button>
    </div>

    <!-- Tasks List -->
    <div v-else class="space-y-4">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="card p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
        @click="viewTask(task.id)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                {{ task.title }}
              </h3>
              <span
                :class="[
                  'badge text-xs',
                  `priority-${task.priority}`,
                  `status-${task.status}`
                ]"
              >
                {{ task.priority }}
              </span>
              <span
                :class="[
                  'badge text-xs',
                  `status-${task.status}`
                ]"
              >
                {{ task.status.replace('_', ' ') }}
              </span>
            </div>
            
            <p v-if="task.description" class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {{ task.description }}
            </p>

            <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div v-if="task.assignee_name" class="flex items-center">
                <img
                  :src="task.assignee_avatar || defaultAvatar"
                  :alt="task.assignee_name"
                  class="w-5 h-5 rounded-full mr-2"
                />
                <span>{{ task.assignee_name }}</span>
              </div>
              <div v-if="task.due_date" class="flex items-center">
                <Calendar class="h-4 w-4 mr-1" />
                <span :class="{ 'text-red-500': isOverdue(task.due_date) }">
                  {{ formatDate(task.due_date) }}
                </span>
              </div>
              <div class="flex items-center">
                <FolderOpen class="h-4 w-4 mr-1" />
                <span>{{ task.project_name }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2 ml-4">
            <button
              @click.stop="editTask(task)"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Edit class="h-4 w-4" />
            </button>
            <button
              @click.stop="deleteTask(task)"
              class="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <Trash2 class="h-4 w-4" />
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
import { useRouter } from 'vue-router'
import {
  Plus,
  CheckSquare,
  Calendar,
  FolderOpen,
  Edit,
  Trash2
} from 'lucide-vue-next'

export default {
  name: 'Tasks',
  components: {
    Plus,
    CheckSquare,
    Calendar,
    FolderOpen,
    Edit,
    Trash2
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const searchQuery = ref('')
    const statusFilter = ref('')
    const priorityFilter = ref('')

    const tasks = computed(() => store.getters['tasks/tasks'])
    const filteredTasks = computed(() => store.getters['tasks/filteredTasks'])
    const isLoading = computed(() => store.getters['tasks/isLoading'])

    const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'

    const createTask = () => {
      store.dispatch('modals/showTaskModal')
    }

    const editTask = (task) => {
      store.dispatch('modals/showTaskModal', task)
    }

    const viewTask = (taskId) => {
      router.push(`/tasks/${taskId}`)
    }

    const deleteTask = async (task) => {
      if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
        try {
          await store.dispatch('tasks/deleteTask', task.id)
        } catch (error) {
          console.error('Delete task error:', error)
        }
      }
    }

    const handleSearch = () => {
      store.dispatch('tasks/setFilters', { search: searchQuery.value })
    }

    const handleFilter = () => {
      store.dispatch('tasks/setFilters', {
        status: statusFilter.value,
        priority: priorityFilter.value
      })
    }

    const clearFilters = () => {
      searchQuery.value = ''
      statusFilter.value = ''
      priorityFilter.value = ''
      store.dispatch('tasks/clearFilters')
    }

    const isOverdue = (dueDate) => {
      return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    onMounted(() => {
      // Load tasks for all projects
      store.dispatch('projects/fetchProjects').then(() => {
        const projects = store.getters['projects/projects']
        if (projects.length > 0) {
          // Load tasks for the first project as an example
          store.dispatch('tasks/fetchTasks', projects[0].id)
        }
      })
    })

    return {
      searchQuery,
      statusFilter,
      priorityFilter,
      tasks,
      filteredTasks,
      isLoading,
      defaultAvatar,
      createTask,
      editTask,
      viewTask,
      deleteTask,
      handleSearch,
      handleFilter,
      clearFilters,
      isOverdue,
      formatDate
    }
  }
}
</script>
