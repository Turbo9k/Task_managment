<template>
  <div class="p-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-6">
      <div class="skeleton h-8 w-1/3"></div>
      <div class="skeleton h-4 w-2/3"></div>
      <div class="skeleton h-64 w-full"></div>
    </div>

    <!-- Project Not Found -->
    <div v-else-if="!project" class="text-center py-12">
      <FolderX class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Project not found</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-6">
        The project you're looking for doesn't exist or you don't have access to it.
      </p>
      <router-link to="/projects" class="btn-primary">
        Back to Projects
      </router-link>
    </div>

    <!-- Project Detail -->
    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="$router.push('/projects')"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ArrowLeft class="h-5 w-5" />
          </button>
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ project.name }}
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
              {{ project.description || 'No description provided' }}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <span
            v-if="project.role === 'admin'"
            class="badge-admin text-xs"
          >
            👑 Admin
          </span>
          <button
            v-if="project.role === 'admin'"
            @click="editProject"
            class="btn-outline"
          >
            <Settings class="h-4 w-4 mr-2" />
            Edit Project
          </button>
          <button
            v-if="project.role === 'admin'"
            @click="deleteProject"
            class="btn-outline text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
          >
            <Trash2 class="h-4 w-4 mr-2" />
            Delete Project
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="card p-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ projectStats.total_tasks || 0 }}
          </div>
        </div>
        <div class="card p-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ projectStats.in_progress_tasks || 0 }}
          </div>
        </div>
        <div class="card p-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ projectStats.done_tasks || 0 }}
          </div>
        </div>
        <div class="card p-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
          <div class="text-2xl font-bold text-red-600 dark:text-red-400">
            {{ projectStats.overdue_tasks || 0 }}
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Tasks Section -->
        <div class="lg:col-span-2 space-y-6">
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Tasks</h2>
              <button
                @click="createTask"
                class="btn-primary text-sm"
              >
                <Plus class="h-4 w-4 mr-2" />
                New Task
              </button>
            </div>
            <div v-if="tasks.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              No tasks yet. Create your first task!
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="task in tasks"
                :key="task.id"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div class="flex-1">
                  <div class="font-medium text-gray-900 dark:text-white">{{ task.title }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ task.description }}</div>
                </div>
                <div class="flex items-center space-x-2">
                  <span :class="getStatusBadgeClass(task.status)">
                    {{ task.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Members Section -->
        <div class="space-y-6">
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Team Members</h2>
              <button
                v-if="project.role === 'admin'"
                @click="addMember"
                class="btn-primary text-sm"
              >
                <UserPlus class="h-4 w-4 mr-2" />
                Add Member
              </button>
            </div>
            <div v-if="members.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
              No members yet.
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="member in members"
                :key="member.id"
                class="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              >
                <div class="flex items-center space-x-3">
                  <img
                    :src="member.avatar || 'https://ui-avatars.com/api/?name=' + member.name"
                    :alt="member.name"
                    class="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">{{ member.name }}</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">{{ member.email }}</div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-xs px-2 py-1 rounded" :class="getRoleBadgeClass(member.role)">
                    {{ member.role }}
                  </span>
                  <button
                    v-if="project.role === 'admin' && member.id !== currentUser.id"
                    @click="removeMember(member.id)"
                    class="text-red-500 hover:text-red-700 text-sm"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import {
  ArrowLeft,
  Settings,
  Plus,
  UserPlus,
  X,
  FolderX,
  Trash2
} from 'lucide-vue-next'

export default {
  name: 'ProjectDetail',
  components: {
    ArrowLeft,
    Settings,
    Plus,
    UserPlus,
    X,
    FolderX,
    Trash2
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    const project = ref(null)
    const projectStats = ref({})
    const members = ref([])
    const tasks = ref([])
    const isLoading = ref(true)

    const currentUser = computed(() => store.getters['auth/user'])

    const loadProject = async () => {
      try {
        isLoading.value = true
        const projectId = route.params.id
        
        // Fetch project details
        const response = await store.dispatch('projects/fetchProject', projectId)
        project.value = response
        
        // Extract stats and members from response
        if (response.stats) {
          projectStats.value = response.stats
        }
        if (response.members) {
          members.value = response.members
        }
        if (response.tasks) {
          tasks.value = response.tasks
        }
      } catch (error) {
        console.error('Failed to load project:', error)
        project.value = null
      } finally {
        isLoading.value = false
      }
    }

    const addMember = () => {
      store.dispatch('modals/showUserModal', { projectId: project.value.id })
      // Reload project after modal closes (member added via socket or manual reload)
      setTimeout(() => {
        loadProject()
      }, 1000)
    }

    const removeMember = async (userId) => {
      if (!confirm('Are you sure you want to remove this member?')) return
      
      try {
        await store.dispatch('projects/removeMember', {
          projectId: project.value.id,
          userId
        })
        members.value = members.value.filter(m => m.id !== userId)
      } catch (error) {
        console.error('Failed to remove member:', error)
      }
    }

    const editProject = () => {
      store.dispatch('modals/showProjectModal', project.value)
    }

    const createTask = () => {
      store.dispatch('modals/showTaskModal', { projectId: project.value.id })
    }

    const deleteProject = async () => {
      if (!confirm(`Are you sure you want to delete "${project.value.name}"? This action cannot be undone.`)) {
        return
      }
      
      try {
        await store.dispatch('projects/deleteProject', project.value.id)
        router.push('/projects')
      } catch (error) {
        console.error('Failed to delete project:', error)
        alert(error.response?.data?.error || 'Failed to delete project')
      }
    }

    const getStatusBadgeClass = (status) => {
      const classes = {
        todo: 'badge-todo',
        in_progress: 'badge-in-progress',
        review: 'badge-review',
        done: 'badge-done'
      }
      return classes[status] || 'badge-todo'
    }

    const getRoleBadgeClass = (role) => {
      const classes = {
        admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        member: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      }
      return classes[role] || classes.member
    }

    // Watch for route changes
    watch(() => route.params.id, () => {
      loadProject()
    })

    // Watch for member additions via store
    watch(() => store.getters['projects/currentProject'], (newProject) => {
      if (newProject && newProject.id === parseInt(route.params.id)) {
        if (newProject.members) {
          members.value = newProject.members
        }
      }
    }, { deep: true })

    onMounted(() => {
      loadProject()
    })

    return {
      project,
      projectStats,
      members,
      tasks,
      isLoading,
      currentUser,
      addMember,
      removeMember,
      editProject,
      createTask,
      deleteProject,
      getStatusBadgeClass,
      getRoleBadgeClass
    }
  }
}
</script>

