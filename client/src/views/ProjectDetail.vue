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
                class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
              >
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <h3 class="font-medium text-gray-900 dark:text-white">{{ task.title }}</h3>
                    <span
                      :class="[
                        'badge text-xs',
                        `priority-${task.priority || 'medium'}`
                      ]"
                    >
                      {{ task.priority || 'medium' }}
                    </span>
                  </div>
                  <p v-if="task.description" class="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                    {{ task.description }}
                  </p>
                  <div class="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <div v-if="task.assignee_name" class="flex items-center">
                      <img
                        :src="getAvatarUrl(task.assignee_name, task.assignee_avatar)"
                        :alt="task.assignee_name"
                        class="w-4 h-4 rounded-full mr-1"
                      />
                      <span>{{ task.assignee_name }}</span>
                    </div>
                    <div v-if="task.comment_count > 0" class="flex items-center">
                      <MessageCircle class="h-3 w-3 mr-1" />
                      <span>{{ task.comment_count }} note{{ task.comment_count !== 1 ? 's' : '' }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <select
                    :value="task.status"
                    @change="updateTaskStatus(task.id, $event.target.value)"
                    @click.stop
                    :class="getStatusBadgeClass(task.status)"
                    class="text-xs px-2 py-1 rounded border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                  <button
                    @click.stop="editTask(task)"
                    class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
                    title="Edit Task"
                  >
                    <Edit class="h-4 w-4" />
                  </button>
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
                    :src="getAvatarUrl(member.name, member.avatar)"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
  Trash2,
  Edit,
  MessageCircle
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
    Trash2,
    Edit,
    MessageCircle
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
        
        // Fetch tasks for this project
        try {
          const tasksResponse = await store.dispatch('tasks/fetchTasks', projectId)
          console.log('[ProjectDetail] Fetched tasks:', tasksResponse)
          tasks.value = Array.isArray(tasksResponse) ? tasksResponse : []
          console.log('[ProjectDetail] Tasks value set to:', tasks.value.length, 'tasks')
        } catch (error) {
          console.error('[ProjectDetail] Failed to fetch tasks:', error)
          tasks.value = []
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

    const editTask = (task) => {
      store.dispatch('modals/showTaskModal', task)
    }

    const updateTaskStatus = async (taskId, newStatus) => {
      try {
        await store.dispatch('tasks/updateTask', {
          taskId,
          taskData: { status: newStatus }
        })
        // Update local tasks array
        const taskIndex = tasks.value.findIndex(t => t.id === taskId)
        if (taskIndex !== -1) {
          tasks.value[taskIndex].status = newStatus
        }
      } catch (error) {
        console.error('Failed to update task status:', error)
      }
    }

    // Import avatar utility
    const getAvatarUrl = (name, avatar) => {
      if (avatar && avatar.trim() !== '') return avatar
      if (!name) return 'https://ui-avatars.com/api/?name=User&background=random'
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
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

    // Real-time task updates via Socket.io
    watch(() => store.getters['socket/isConnected'], (isConnected) => {
      if (isConnected && project.value) {
        store.dispatch('socket/joinProject', project.value.id)
      }
    })

    // Listen for task updates from store (but don't override local tasks unnecessarily)
    // Note: We're watching but not mutating store state - we're updating local ref
    const unwatchTasks = store.watch(
      (state) => state.tasks.tasks,
      (newTasks) => {
        if (project.value && Array.isArray(newTasks)) {
          // Only update if we have tasks for this project in the store
          const projectTasks = newTasks.filter(t => t.project_id === project.value.id)
          // Only update if the store has tasks for this project and our local array is empty or different
          if (projectTasks.length > 0 && (tasks.value.length === 0 || projectTasks.length !== tasks.value.length)) {
            console.log('[ProjectDetail] Updating tasks from store:', projectTasks.length)
            // Create a new array to avoid mutation issues
            tasks.value = [...projectTasks]
          }
        }
      },
      { deep: true }
    )

    onMounted(async () => {
      await loadProject()
      
      // Connect to socket and join project room
      await store.dispatch('socket/connect')
      
      if (project.value) {
        store.dispatch('socket/joinProject', project.value.id)
      }

      // Set up socket listeners after connection
      const setupSocketListeners = () => {
        const socket = store.state.socket.socket
        if (!socket) return

        // Remove old listeners if any
        socket.off('task_created')
        socket.off('task_updated')
        socket.off('task_deleted')

        // Add new listeners
        socket.on('task_created', (task) => {
          if (task.project_id === parseInt(route.params.id)) {
            const exists = tasks.value.find(t => t.id === task.id)
            if (!exists) {
              tasks.value.push(task)
            }
          }
        })

        socket.on('task_updated', (task) => {
          if (task.project_id === parseInt(route.params.id)) {
            const index = tasks.value.findIndex(t => t.id === task.id)
            if (index !== -1) {
              tasks.value[index] = { ...tasks.value[index], ...task }
            } else {
              tasks.value.push(task)
            }
          }
        })

        socket.on('task_deleted', ({ id }) => {
          tasks.value = tasks.value.filter(t => t.id !== id)
        })
      }

      // Set up listeners immediately if socket exists, or wait for connection
      if (store.state.socket.socket) {
        setupSocketListeners()
      } else {
        watch(() => store.getters['socket/isConnected'], (isConnected) => {
          if (isConnected) {
            setupSocketListeners()
            if (project.value) {
              store.dispatch('socket/joinProject', project.value.id)
            }
          }
        }, { immediate: true })
      }
    })

    onUnmounted(() => {
      if (project.value) {
        store.dispatch('socket/leaveProject', project.value.id)
      }
      unwatchTasks()
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
      editTask,
      updateTaskStatus,
      deleteProject,
      getStatusBadgeClass,
      getRoleBadgeClass,
      getAvatarUrl
    }
  }
}
</script>

