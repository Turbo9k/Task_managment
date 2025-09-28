<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage your team's projects and tasks</p>
      </div>
      <button
        @click="createProject"
        class="btn-primary"
      >
        <Plus class="h-4 w-4 mr-2" />
        New Project
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="card p-6">
        <div class="skeleton h-4 w-3/4 mb-2"></div>
        <div class="skeleton h-3 w-1/2 mb-4"></div>
        <div class="skeleton h-8 w-full"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="projects.length === 0" class="text-center py-12">
      <FolderOpen class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        Get started by creating your first project.
      </p>
      <button
        @click="createProject"
        class="btn-primary"
      >
        <Plus class="h-4 w-4 mr-2" />
        Create Project
      </button>
    </div>

    <!-- Projects Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in projects"
        :key="project.id"
        class="card p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        @click="viewProject(project.id)"
      >
        <!-- Project Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center">
            <div
              class="w-4 h-4 rounded-full mr-3"
              :style="{ backgroundColor: project.color }"
            ></div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ project.name }}
            </h3>
          </div>
          <div class="flex items-center space-x-2">
            <span
              v-if="project.role === 'admin'"
              class="badge badge-primary text-xs"
            >
              Admin
            </span>
            <button
              @click.stop="editProject(project)"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <MoreVertical class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Project Description -->
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {{ project.description || 'No description provided' }}
        </p>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{{ progressPercentage(project) }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progressPercentage(project)}%` }"
            ></div>
          </div>
        </div>

        <!-- Stats -->
        <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <CheckSquare class="h-4 w-4 mr-1" />
              <span>{{ project.task_count || 0 }} tasks</span>
            </div>
            <div class="flex items-center">
              <Users class="h-4 w-4 mr-1" />
              <span>{{ project.member_count || 0 }} members</span>
            </div>
          </div>
          <div class="text-xs">
            {{ formatDate(project.created_at) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import {
  Plus,
  FolderOpen,
  MoreVertical,
  CheckSquare,
  Users
} from 'lucide-vue-next'

export default {
  name: 'Projects',
  components: {
    Plus,
    FolderOpen,
    MoreVertical,
    CheckSquare,
    Users
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const projects = computed(() => store.getters['projects/projects'])
    const isLoading = computed(() => store.getters['projects/isLoading'])

    const createProject = () => {
      store.dispatch('modals/showProjectModal')
    }

    const editProject = (project) => {
      store.dispatch('modals/showProjectModal', project)
    }

    const viewProject = (projectId) => {
      router.push(`/projects/${projectId}`)
    }

    const progressPercentage = (project) => {
      if (!project.task_count || project.task_count === 0) return 0
      return Math.round((project.completed_tasks / project.task_count) * 100)
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
      store.dispatch('projects/fetchProjects')
    })

    return {
      projects,
      isLoading,
      createProject,
      editProject,
      viewProject,
      progressPercentage,
      formatDate
    }
  }
}
</script>
