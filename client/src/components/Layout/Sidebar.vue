<template>
  <div 
    :class="[
      'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out',
      sidebarCollapsed ? 'w-16' : 'w-64'
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
      <div v-if="!sidebarCollapsed" class="flex items-center">
        <h1 class="text-xl font-bold text-primary-600 dark:text-primary-400">TaskFlow</h1>
      </div>
      <div v-else class="flex items-center justify-center w-full">
        <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">T</span>
        </div>
      </div>
      <button
        @click="toggleSidebar"
        class="p-1 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <ChevronLeft v-if="!sidebarCollapsed" class="h-5 w-5" />
        <ChevronRight v-else class="h-5 w-5" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-4 space-y-1">
      <router-link
        v-for="item in navigationItems"
        :key="item.name"
        :to="item.href"
        :class="[
          'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
          $route.path === item.href
            ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
        ]"
      >
        <component
          :is="item.icon"
          :class="[
            'mr-3 h-5 w-5 flex-shrink-0',
            $route.path === item.href
              ? 'text-primary-500 dark:text-primary-400'
              : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
          ]"
        />
        <span v-if="!sidebarCollapsed">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- User Profile -->
    <div class="border-t border-gray-200 dark:border-gray-700 p-4">
      <div v-if="!sidebarCollapsed" class="flex items-center">
        <div class="flex-shrink-0">
          <img
            :src="user?.avatar || defaultAvatar"
            :alt="user?.name"
            class="h-8 w-8 rounded-full"
          />
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ user?.name }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ user?.email }}</p>
        </div>
      </div>
      <div v-else class="flex justify-center">
        <img
          :src="user?.avatar || defaultAvatar"
          :alt="user?.name"
          class="h-8 w-8 rounded-full"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import {
  Home,
  FolderOpen,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

export default {
  name: 'Sidebar',
  components: {
    Home,
    FolderOpen,
    CheckSquare,
    Calendar,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight
  },
  setup() {
    const store = useStore()
    const route = useRoute()

    const user = computed(() => store.getters['auth/user'])
    const sidebarCollapsed = computed(() => store.getters['ui/sidebarCollapsed'])

    const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'

    const navigationItems = [
      { name: 'Dashboard', href: '/dashboard', icon: 'Home' },
      { name: 'Projects', href: '/projects', icon: 'FolderOpen' },
      { name: 'Tasks', href: '/tasks', icon: 'CheckSquare' },
      { name: 'Calendar', href: '/calendar', icon: 'Calendar' },
      { name: 'Analytics', href: '/analytics', icon: 'BarChart3' },
      { name: 'Settings', href: '/settings', icon: 'Settings' }
    ]

    const toggleSidebar = () => {
      store.dispatch('ui/toggleSidebar')
    }

    return {
      user,
      sidebarCollapsed,
      defaultAvatar,
      navigationItems,
      toggleSidebar
    }
  }
}
</script>
