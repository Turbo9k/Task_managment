<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
    <!-- Navigation -->
    <nav class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center space-x-3">
              <!-- Enhanced Logo -->
              <div class="relative">
                <div class="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl shadow-lg flex items-center justify-center transform hover:rotate-3 transition-transform duration-300">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                </div>
                <div class="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-accent-400 to-accent-500 rounded-full animate-pulse"></div>
              </div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 dark:from-primary-400 dark:via-primary-300 dark:to-primary-200 bg-clip-text text-transparent">
                TaskFlow
              </h1>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="toggleDarkMode"
              class="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Sun v-if="darkMode" class="h-5 w-5" />
              <Moon v-else class="h-5 w-5" />
            </button>
            <router-link
              to="/login"
              class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign In
            </router-link>
            <router-link
              to="/register"
              class="btn-primary"
            >
              Get Started
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center">
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Collaborative
          <span class="text-primary-600 dark:text-primary-400">Task Management</span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Streamline your team's workflow with real-time collaboration, intuitive project tracking, 
          and powerful analytics. Built for modern teams who value efficiency and transparency.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/register"
            class="btn-primary btn-lg"
          >
            Start Free Trial
          </router-link>
          <button
            @click="scrollToFeatures"
            class="btn-outline btn-lg"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div ref="featuresSection" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Everything you need to manage tasks
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Powerful features designed to boost your team's productivity and collaboration.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="card p-6 text-center">
          <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users class="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Real-time Collaboration</h3>
          <p class="text-gray-600 dark:text-gray-300">
            See team members working on tasks in real-time with live updates and notifications.
          </p>
        </div>

        <div class="card p-6 text-center">
          <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Kanban class="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Kanban Boards</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Visualize your workflow with drag-and-drop boards that adapt to your team's process.
          </p>
        </div>

        <div class="card p-6 text-center">
          <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 class="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Analytics Dashboard</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Track progress, identify bottlenecks, and measure team performance with detailed insights.
          </p>
        </div>

        <div class="card p-6 text-center">
          <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Calendar class="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Calendar View</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Plan and visualize deadlines with calendar integration and timeline views.
          </p>
        </div>

        <div class="card p-6 text-center">
          <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageSquare class="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Team Communication</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Keep discussions organized with task comments and project-wide activity feeds.
          </p>
        </div>

        <div class="card p-6 text-center">
          <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield class="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Secure & Reliable</h3>
          <p class="text-gray-600 dark:text-gray-300">
            Enterprise-grade security with role-based permissions and data encryption.
          </p>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-primary-600 dark:bg-primary-700 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to transform your team's productivity?
        </h2>
        <p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Join thousands of teams who have already improved their workflow with TaskFlow.
        </p>
        <router-link
          to="/register"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
        >
          Get Started Free
          <ArrowRight class="ml-2 h-5 w-5" />
        </router-link>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center">
          <div class="flex justify-center mb-4">
            <div class="relative">
              <div class="w-12 h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl shadow-lg flex items-center justify-center transform hover:rotate-3 transition-transform duration-300">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                </svg>
              </div>
              <div class="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-accent-400 to-accent-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 class="text-2xl font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 dark:from-primary-400 dark:via-primary-300 dark:to-primary-200 bg-clip-text text-transparent mb-4">
            TaskFlow
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Built with Vue.js, Express.js, and Socket.io for modern teams.
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            © 2024 TaskFlow. Professional task management for modern teams.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { 
  Sun, 
  Moon, 
  Users, 
  Kanban, 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Shield, 
  ArrowRight 
} from 'lucide-vue-next'

export default {
  name: 'Home',
  components: {
    Sun,
    Moon,
    Users,
    Kanban,
    BarChart3,
    Calendar,
    MessageSquare,
    Shield,
    ArrowRight
  },
  setup() {
    const store = useStore()
    const featuresSection = ref(null)

    const darkMode = computed(() => store.getters['ui/darkMode'])

    const toggleDarkMode = () => {
      store.dispatch('ui/toggleDarkMode')
    }

    const scrollToFeatures = () => {
      featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
    }

    return {
      darkMode,
      toggleDarkMode,
      scrollToFeatures,
      featuresSection
    }
  }
}
</script>
