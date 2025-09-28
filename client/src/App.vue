<template>
  <div id="app">
    <!-- Simple Working App -->
    <div class="min-h-screen bg-gray-50">
      <!-- Navigation -->
      <nav class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-blue-600">TaskFlow</h1>
            </div>
            <div class="flex items-center space-x-4">
              <button @click="toggleDarkMode" class="p-2 rounded-md text-gray-400 hover:text-gray-500">
                {{ darkMode ? '☀️' : '🌙' }}
              </button>
              <button @click="login" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
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
            <h2 class="text-3xl font-bold text-gray-900 mb-4">
              Welcome to TaskFlow
            </h2>
            <p class="text-lg text-gray-600 mb-6">
              Collaborative task management made simple
            </p>
            <div v-if="isAuthenticated" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              ✅ You are logged in as: {{ user.name || 'Demo User' }}
            </div>
          </div>

          <!-- Features Grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="text-blue-600 text-2xl mb-2">📋</div>
              <h3 class="text-lg font-semibold mb-2">Task Management</h3>
              <p class="text-gray-600">Create, organize, and track tasks with ease</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="text-blue-600 text-2xl mb-2">👥</div>
              <h3 class="text-lg font-semibold mb-2">Team Collaboration</h3>
              <p class="text-gray-600">Work together in real-time with your team</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
              <div class="text-blue-600 text-2xl mb-2">📊</div>
              <h3 class="text-lg font-semibold mb-2">Analytics</h3>
              <p class="text-gray-600">Track progress and measure productivity</p>
            </div>
          </div>

          <!-- Demo Actions -->
          <div class="text-center">
            <button @click="createProject" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mr-4">
              Create Project
            </button>
            <button @click="addTask" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 mr-4">
              Add Task
            </button>
            <button @click="showNotification" class="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
              Test Notification
            </button>
          </div>

          <!-- Status Messages -->
          <div v-if="message" class="mt-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            {{ message }}
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'App',
  setup() {
    const darkMode = ref(false)
    const isAuthenticated = ref(false)
    const user = ref({ name: 'Demo User' })
    const message = ref('')

    const toggleDarkMode = () => {
      darkMode.value = !darkMode.value
      message.value = `Dark mode ${darkMode.value ? 'enabled' : 'disabled'}`
      setTimeout(() => { message.value = '' }, 3000)
    }

    const login = () => {
      isAuthenticated.value = !isAuthenticated.value
      message.value = isAuthenticated.value ? 'Welcome to TaskFlow!' : 'Logged out successfully'
      setTimeout(() => { message.value = '' }, 3000)
    }

    const createProject = () => {
      message.value = 'Project created successfully! (Demo)'
      setTimeout(() => { message.value = '' }, 3000)
    }

    const addTask = () => {
      message.value = 'Task added successfully! (Demo)'
      setTimeout(() => { message.value = '' }, 3000)
    }

    const showNotification = () => {
      message.value = 'Notification sent! (Demo)'
      setTimeout(() => { message.value = '' }, 3000)
    }

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
