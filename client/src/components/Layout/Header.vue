<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between h-16 px-4">
      <!-- Left side -->
      <div class="flex items-center">
        <button
          @click="toggleSidebar"
          class="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
        >
          <Menu class="h-5 w-5" />
        </button>
        
        <!-- Breadcrumb -->
        <nav class="hidden lg:flex ml-4" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2">
            <li v-for="(item, index) in breadcrumbs" :key="item.name" class="flex items-center">
              <ChevronRight v-if="index > 0" class="h-4 w-4 text-gray-400 mr-2" />
              <span
                :class="[
                  'text-sm font-medium',
                  index === breadcrumbs.length - 1
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                ]"
              >
                {{ item.name }}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <!-- Center - Search -->
      <div class="flex-1 max-w-lg mx-4 hidden md:block">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search class="h-4 w-4 text-gray-400" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tasks, projects..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>

      <!-- Right side -->
      <div class="flex items-center space-x-4">
        <!-- Notifications -->
        <div class="relative">
          <button
            @click="toggleNotifications"
            class="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
          >
            <Bell class="h-5 w-5" />
            <span
              v-if="unreadNotifications > 0"
              class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            >
              {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
            </span>
          </button>

          <!-- Notifications dropdown -->
          <div
            v-if="showNotifications"
            class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          >
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
                <button
                  @click="markAllRead"
                  class="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Mark all read
                </button>
              </div>
            </div>
            <div class="max-h-64 overflow-y-auto">
              <div v-if="notifications.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications
              </div>
              <div v-else>
                <div
                  v-for="notification in notifications.slice(0, 5)"
                  :key="notification.id"
                  class="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  @click="markNotificationRead(notification.id)"
                >
                  <div class="flex items-start">
                    <div class="flex-shrink-0">
                      <div class="w-2 h-2 bg-primary-500 rounded-full mt-2" v-if="!notification.is_read"></div>
                    </div>
                    <div class="ml-3 flex-1">
                      <p class="text-sm font-medium text-gray-900 dark:text-white">{{ notification.title }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ notification.message }}</p>
                      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {{ formatTime(notification.created_at) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dark mode toggle -->
        <button
          @click="toggleDarkMode"
          class="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
        >
          <Sun v-if="darkMode" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </button>

        <!-- User menu -->
        <div class="relative">
          <button
            @click="toggleUserMenu"
            class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <img
              :src="user?.avatar || defaultAvatar"
              :alt="user?.name"
              class="h-8 w-8 rounded-full"
            />
          </button>

          <!-- User dropdown -->
          <div
            v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
          >
            <div class="py-1">
              <div class="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ user?.name }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ user?.email }}</p>
              </div>
              <router-link
                to="/profile"
                class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="showUserMenu = false"
              >
                Your Profile
              </router-link>
              <router-link
                to="/settings"
                class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="showUserMenu = false"
              >
                Settings
              </router-link>
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-vue-next'

export default {
  name: 'Header',
  components: {
    Menu,
    Search,
    Bell,
    Sun,
    Moon,
    ChevronRight
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const searchQuery = ref('')
    const showNotifications = ref(false)
    const showUserMenu = ref(false)

    const user = computed(() => store.getters['auth/user'])
    const darkMode = computed(() => store.getters['ui/darkMode'])
    const notifications = computed(() => store.getters['ui/notifications'])
    const unreadNotifications = computed(() => store.getters['ui/unreadNotifications'])

    const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'

    const breadcrumbs = computed(() => {
      const pathSegments = route.path.split('/').filter(segment => segment)
      const breadcrumbs = [{ name: 'Dashboard', href: '/dashboard' }]

      if (pathSegments.length === 0) return breadcrumbs

      pathSegments.forEach((segment, index) => {
        const href = '/' + pathSegments.slice(0, index + 1).join('/')
        const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        breadcrumbs.push({ name, href })
      })

      return breadcrumbs
    })

    const toggleSidebar = () => {
      store.dispatch('ui/toggleSidebar')
    }

    const toggleDarkMode = () => {
      store.dispatch('ui/toggleDarkMode')
    }

    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value
      showUserMenu.value = false
    }

    const toggleUserMenu = () => {
      showUserMenu.value = !showUserMenu.value
      showNotifications.value = false
    }

    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
      }
    }

    const handleLogout = async () => {
      await store.dispatch('auth/logout')
      router.push('/login')
    }

    const markNotificationRead = (notificationId) => {
      store.dispatch('ui/markNotificationRead', notificationId)
    }

    const markAllRead = () => {
      store.dispatch('ui/markAllNotificationsRead')
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

    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        showNotifications.value = false
        showUserMenu.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      searchQuery,
      showNotifications,
      showUserMenu,
      user,
      darkMode,
      notifications,
      unreadNotifications,
      defaultAvatar,
      breadcrumbs,
      toggleSidebar,
      toggleDarkMode,
      toggleNotifications,
      toggleUserMenu,
      handleSearch,
      handleLogout,
      markNotificationRead,
      markAllRead,
      formatTime
    }
  }
}
</script>
