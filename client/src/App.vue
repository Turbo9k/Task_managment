<template>
  <div id="app">
    <!-- Simple Test -->
    <div style="padding: 20px; background: #f0f0f0; min-height: 100vh;">
      <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">TaskFlow - Test Page</h1>
      <p style="color: #666; margin-bottom: 10px;">Vue.js is working!</p>
      <p style="color: #666; margin-bottom: 10px;">isLoading: {{ isLoading }}</p>
      <p style="color: #666; margin-bottom: 10px;">isAuthenticated: {{ isAuthenticated }}</p>
      
      <div style="margin-top: 20px;">
        <button @click="testClick" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Test Button
        </button>
        <p v-if="clicked" style="color: green; margin-top: 10px;">Button clicked! Vue is working correctly.</p>
      </div>
      
      <div style="margin-top: 20px;">
        <router-link to="/login" style="color: #007bff; text-decoration: underline;">Go to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'App',
  setup() {
    const store = useStore()
    const clicked = ref(false)

    const isLoading = computed(() => store.state.auth.isLoading)
    const isAuthenticated = computed(() => store.state.auth.isAuthenticated)

    const testClick = () => {
      clicked.value = true
    }

    onMounted(async () => {
      console.log('App mounted!')
      // Initialize app
      await store.dispatch('auth/checkAuth')
    })

    return {
      isLoading,
      isAuthenticated,
      clicked,
      testClick
    }
  }
}
</script>

<style>
/* Global styles are in main.css */
</style>
