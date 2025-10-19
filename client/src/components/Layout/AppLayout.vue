<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <Header />
    
    <!-- Main Content Area -->
    <div class="flex">
      <!-- Sidebar -->
      <Sidebar />
      
      <!-- Main Content -->
      <main class="flex-1 lg:ml-64">
        <div class="py-6">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Modals -->
    <ProjectModal v-if="showProjectModal" />
    <TaskModal v-if="showTaskModal" />
    <UserModal v-if="showUserModal" />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import ProjectModal from '../Modals/ProjectModal.vue'
import TaskModal from '../Modals/TaskModal.vue'
import UserModal from '../Modals/UserModal.vue'

export default {
  name: 'AppLayout',
  components: {
    Header,
    Sidebar,
    ProjectModal,
    TaskModal,
    UserModal
  },
  setup() {
    const store = useStore()

    const showProjectModal = computed(() => store.getters['modals/showProjectModal'])
    const showTaskModal = computed(() => store.getters['modals/showTaskModal'])
    const showUserModal = computed(() => store.getters['modals/showUserModal'])

    return {
      showProjectModal,
      showTaskModal,
      showUserModal
    }
  }
}
</script>
