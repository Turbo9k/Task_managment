<template>
  <div id="app" :class="{ 'dark': darkMode }">
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <!-- Navigation -->
      <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">TaskFlow</h1>
            </div>
            <div class="flex items-center space-x-4">
              <button @click="toggleDarkMode" class="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200">
                <Sun v-if="darkMode" class="h-5 w-5" />
                <Moon v-else class="h-5 w-5" />
              </button>
              <button @click="login" class="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200">
                {{ isAuthenticated ? 'Dashboard' : 'Login' }}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Welcome Section -->
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Welcome to TaskFlow
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">
              Collaborative task management made simple
            </p>
            <div v-if="isAuthenticated" class="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4 transition-colors duration-300">
              ✅ You are logged in as: {{ user.name || 'Demo User' }}
            </div>
          </div>

          <!-- Features Grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div class="text-blue-600 dark:text-blue-400 text-2xl mb-2">📋</div>
              <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Task Management</h3>
              <p class="text-gray-600 dark:text-gray-400">Create, organize, and track tasks with ease</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div class="text-blue-600 dark:text-blue-400 text-2xl mb-2">👥</div>
              <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Team Collaboration</h3>
              <p class="text-gray-600 dark:text-gray-400">Work together in real-time with your team</p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div class="text-blue-600 dark:text-blue-400 text-2xl mb-2">📊</div>
              <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Analytics</h3>
              <p class="text-gray-600 dark:text-gray-400">Track progress and measure productivity</p>
            </div>
          </div>

          <!-- Demo Actions -->
          <div class="text-center">
            <button @click="createProject" class="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 mr-4 transition-all duration-200 hover:scale-105">
              Create Project
            </button>
            <button @click="addTask" class="bg-green-600 dark:bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 mr-4 transition-all duration-200 hover:scale-105">
              Add Task
            </button>
            <button @click="showNotification" class="bg-purple-600 dark:bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-all duration-200 hover:scale-105">
              Test Notification
            </button>
          </div>

          <!-- Status Messages -->
          <div v-if="message" class="mt-6 p-4 bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-300 rounded transition-colors duration-300">
            {{ message }}
          </div>
        </div>
      </main>

      <!-- Global Chat Widget -->
      <ChatWidget
        v-if="isAuthenticated"
        type="global"
        :item-id="'global'"
        item-name="Global Chat"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Sun, Moon } from 'lucide-vue-next'
import ChatWidget from './components/Chat/ChatWidget.vue'

export default {
  name: 'App',
  components: {
    Sun,
    Moon,
    ChatWidget
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const message = ref('')

    const darkMode = computed(() => store.getters['ui/darkMode'])
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    const user = computed(() => store.getters['auth/user'])

    const toggleDarkMode = () => {
      store.dispatch('ui/toggleDarkMode')
      message.value = `Dark mode ${darkMode.value ? 'enabled' : 'disabled'}`
      setTimeout(() => { message.value = '' }, 3000)
    }

    const login = () => {
      if (isAuthenticated.value) {
        router.push('/dashboard')
      } else {
        store.dispatch('auth/login', { email: 'demo@example.com', password: 'demo' })
        message.value = 'Welcome to TaskFlow!'
        setTimeout(() => { message.value = '' }, 3000)
      }
    }

    const createProject = () => {
      if (isAuthenticated.value) {
        store.dispatch('modals/showProjectModal')
      } else {
        message.value = 'Please login first to create projects'
        setTimeout(() => { message.value = '' }, 3000)
      }
    }

    const addTask = () => {
      if (isAuthenticated.value) {
        store.dispatch('modals/showTaskModal')
      } else {
        message.value = 'Please login first to add tasks'
        setTimeout(() => { message.value = '' }, 3000)
      }
    }

    const showNotification = () => {
      message.value = 'Notification sent! (Demo)'
      setTimeout(() => { message.value = '' }, 3000)
    }

    onMounted(() => {
      // Initialize dark mode from localStorage
      const savedDarkMode = localStorage.getItem('darkMode') === 'true'
      if (savedDarkMode !== darkMode.value) {
        store.dispatch('ui/setDarkMode', savedDarkMode)
      }
    })

    return {
      darkMode,
      isAuthenticated,
      user,
      message,
      toggleDarkMode,
      login,
      createProject,
      addTask,
      showNotification
    }
  }
}
</script>

<style>
/* Custom animations and vibrant effects */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
  50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
}

.gradient-bg {
  background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c);
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}

.floating {
  animation: float 6s ease-in-out infinite;
}

.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Enhanced button styles */
button {
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
  backface-visibility: hidden;
}

button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

button:hover::before {
  left: 100%;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #5a67d8, #6b46c1);
}

/* Dark mode scrollbar */
.dark ::-webkit-scrollbar-track {
  background: #374151;
}

.dark ::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #4f46e5, #7c3aed);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #4338ca, #6d28d9);
}
</style>
