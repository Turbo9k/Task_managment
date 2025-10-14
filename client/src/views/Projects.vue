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
        class="card-vibrant p-6 hover:shadow-glow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-2 animate-fade-in"
        @click="viewProject(project.id)"
      >
        <!-- Project Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center">
            <div
              class="w-6 h-6 rounded-full mr-3 shadow-glow"
              :style="{ backgroundColor: project.color }"
            ></div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ project.name }}
            </h3>
          </div>
          <div class="flex items-center space-x-2">
            <span
              v-if="project.role === 'admin'"
              class="badge-admin text-xs"
            >
              👑 Admin
            </span>
            <span
              v-else-if="project.role === 'manager'"
              class="badge-manager text-xs"
            >
              📊 Manager
            </span>
            <span
              v-else-if="project.role === 'developer'"
              class="badge-developer text-xs"
            >
              💻 Developer
            </span>
            <button
              @click.stop="openProjectChat(project)"
              class="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              title="Open Chat"
            >
              <MessageCircle class="h-4 w-4" />
            </button>
            <button
              @click.stop="editProject(project)"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              title="Edit Project"
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
          <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span class="font-medium">Progress</span>
            <span class="font-bold text-primary-600 dark:text-primary-400">{{ progressPercentage(project) }}%</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
            <div
              class="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 shadow-glow"
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

    <!-- Chat Modal -->
    <ChatModal
      :is-open="showChatModal"
      :type="'project'"
      :item-id="selectedProject?.id"
      :item-name="selectedProject?.name"
      @close="closeChatModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import {
  Plus,
  FolderOpen,
  MoreVertical,
  CheckSquare,
  Users,
  MessageCircle
} from 'lucide-vue-next'
import ChatModal from '../components/Chat/ChatModal.vue'

export default {
  name: 'Projects',
  components: {
    Plus,
    FolderOpen,
    MoreVertical,
    CheckSquare,
    Users,
    MessageCircle,
    ChatModal
  },
  setup() {
    const store = useStore()
    const router = useRouter()

    const showChatModal = ref(false)
    const selectedProject = ref(null)

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

    const openProjectChat = (project) => {
      selectedProject.value = project
      showChatModal.value = true
    }

    const closeChatModal = () => {
      showChatModal.value = false
      selectedProject.value = null
    }

    onMounted(() => {
      store.dispatch('projects/fetchProjects')
    })

    return {
      showChatModal,
      selectedProject,
      projects,
      isLoading,
      createProject,
      editProject,
      viewProject,
      progressPercentage,
      formatDate,
      openProjectChat,
      closeChatModal
    }
  }
}
</script>
