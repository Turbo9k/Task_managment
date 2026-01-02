<template>
  <div class="p-6">
    <!-- Welcome Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome back, {{ user?.name }}! 👋
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Here's what's happening with your projects today.
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card-vibrant p-6 animate-fade-in">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-xl flex items-center justify-center shadow-glow animate-float">
              <CheckSquare class="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.totalTasks || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card-vibrant p-6 animate-fade-in" style="animation-delay: 0.1s">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-gradient-to-br from-success-100 to-success-200 dark:from-success-900 dark:to-success-800 rounded-xl flex items-center justify-center shadow-glow animate-float" style="animation-delay: 0.5s">
              <CheckCircle class="h-6 w-6 text-success-600 dark:text-success-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.completedTasks || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card-vibrant p-6 animate-fade-in" style="animation-delay: 0.2s">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-gradient-to-br from-warning-100 to-warning-200 dark:from-warning-900 dark:to-warning-800 rounded-xl flex items-center justify-center shadow-glow animate-float" style="animation-delay: 1s">
              <Clock class="h-6 w-6 text-warning-600 dark:text-warning-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.inProgressTasks || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="card-vibrant p-6 animate-fade-in" style="animation-delay: 0.3s">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-gradient-to-br from-secondary-100 to-secondary-200 dark:from-secondary-900 dark:to-secondary-800 rounded-xl flex items-center justify-center shadow-glow animate-float" style="animation-delay: 1.5s">
              <FolderOpen class="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Projects</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ stats.projectsCount || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Projects -->
      <div class="lg:col-span-2">
        <div class="card p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Projects</h2>
            <router-link
              to="/projects"
              class="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              View all
            </router-link>
          </div>
          
          <div v-if="isLoading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="skeleton h-16"></div>
          </div>
          
          <div v-else-if="projects.length === 0" class="text-center py-8">
            <FolderOpen class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No projects</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new project.
            </p>
            <div class="mt-6">
              <button
                @click="createProject"
                class="btn-primary"
              >
                <Plus class="h-4 w-4 mr-2" />
                New Project
              </button>
            </div>
          </div>
          
          <div v-else class="space-y-4">
            <div
              v-for="project in projects.slice(0, 5)"
              :key="project.id"
              class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div class="flex items-center">
                <div
                  class="w-4 h-4 rounded-full mr-3"
                  :style="{ backgroundColor: project.color }"
                ></div>
                <div>
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">{{ project.name }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ project.description }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ project.completed_tasks || 0 }}/{{ project.task_count || 0 }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">tasks</p>
                </div>
                <router-link
                  :to="`/projects/${project.id}`"
                  class="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  <ChevronRight class="h-4 w-4" />
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity & Quick Actions -->
      <div class="space-y-6">
        <!-- Quick Actions -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <button
              @click="createProject"
              class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <Plus class="h-4 w-4 mr-3" />
              New Project
            </button>
            <button
              @click="createTask"
              class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <CheckSquare class="h-4 w-4 mr-3" />
              New Task
            </button>
            <router-link
              to="/calendar"
              class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <Calendar class="h-4 w-4 mr-3" />
              View Calendar
            </router-link>
            <router-link
              to="/analytics"
              class="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
            >
              <BarChart3 class="h-4 w-4 mr-3" />
              View Analytics
            </router-link>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div v-if="isLoading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="skeleton h-12"></div>
          </div>
          <div v-else-if="activity.length === 0" class="text-center py-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="item in activity.slice(0, 5)"
              :key="item.id"
              class="flex items-start space-x-3"
            >
              <div class="flex-shrink-0">
                <div class="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900 dark:text-white">{{ item.description }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(item.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import {
  CheckSquare,
  CheckCircle,
  Clock,
  FolderOpen,
  Plus,
  Calendar,
  BarChart3,
  ChevronRight
} from 'lucide-vue-next'

export default {
  name: 'Dashboard',
  components: {
    CheckSquare,
    CheckCircle,
    Clock,
    FolderOpen,
    Plus,
    Calendar,
    BarChart3,
    ChevronRight
  },
  setup() {
    const store = useStore()

    const user = computed(() => store.getters['auth/user'])
    const projects = computed(() => store.getters['projects/projects'])
    const isLoading = computed(() => store.getters['projects/isLoading'])

    const stats = ref({
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      projectsCount: 0
    })

    const activity = ref([])

    const createProject = () => {
      store.dispatch('modals/showProjectModal')
    }

    const createTask = () => {
      store.dispatch('modals/showTaskModal')
    }

    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) return 'Just now'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
      return date.toLocaleDateString()
    }

    const loadDashboardData = async () => {
      try {
        // Load projects
        await store.dispatch('projects/fetchProjects')
        
        // Load user stats
        try {
          const response = await store.dispatch('users/fetchUserStats')
          if (response) {
            stats.value = {
              totalTasks: response.total_tasks || response.totalTasks || 0,
              completedTasks: response.completed_tasks || response.completedTasks || 0,
              inProgressTasks: response.assigned_tasks || response.inProgressTasks || 0,
              projectsCount: response.projects_count || response.projectsCount || 0
            }
          }
        } catch (error) {
          console.error('Failed to load user stats:', error)
        }

        // Load recent activity
        try {
          const activityResponse = await store.dispatch('users/fetchUserActivity')
          if (activityResponse) {
            activity.value = activityResponse
          }
        } catch (error) {
          console.error('Failed to load user activity:', error)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
    }

    onMounted(() => {
      loadDashboardData()
    })

    return {
      user,
      projects,
      isLoading,
      stats,
      activity,
      createProject,
      createTask,
      formatTime
    }
  }
}
</script>
