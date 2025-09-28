<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="loading-spinner mx-auto mb-4 h-8 w-8"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading TaskFlow...</p>
      </div>
    </div>

    <!-- Main App -->
    <div v-else class="flex h-screen">
      <!-- Sidebar -->
      <Sidebar v-if="isAuthenticated" />
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <Header v-if="isAuthenticated" />
        
        <!-- Router View -->
        <main class="flex-1 overflow-auto">
          <router-view />
        </main>
      </div>
    </div>

    <!-- Global Modals -->
    <TaskModal v-if="showTaskModal" />
    <ProjectModal v-if="showProjectModal" />
    <UserModal v-if="showUserModal" />
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import Sidebar from './components/Layout/Sidebar.vue'
import Header from './components/Layout/Header.vue'
import TaskModal from './components/Modals/TaskModal.vue'
import ProjectModal from './components/Modals/ProjectModal.vue'
import UserModal from './components/Modals/UserModal.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    Header,
    TaskModal,
    ProjectModal,
    UserModal
  },
  setup() {
    const store = useStore()

    const isLoading = computed(() => store.state.auth.isLoading)
    const isAuthenticated = computed(() => store.state.auth.isAuthenticated)
    const showTaskModal = computed(() => store.state.modals.showTaskModal)
    const showProjectModal = computed(() => store.state.modals.showProjectModal)
    const showUserModal = computed(() => store.state.modals.showUserModal)

    onMounted(async () => {
      // Initialize app
      await store.dispatch('auth/checkAuth')
      
      // Initialize socket connection if authenticated
      if (isAuthenticated.value) {
        await store.dispatch('socket/connect')
      }
    })

    return {
      isLoading,
      isAuthenticated,
      showTaskModal,
      showProjectModal,
      showUserModal
    }
  }
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  padding: 20px;
  background-color: #f0f0f0;
  min-height: 100vh;
}

h1 {
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #0056b3;
}

p {
  color: #666;
  margin: 10px 0;
}
</style>
