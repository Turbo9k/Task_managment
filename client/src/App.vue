<template>
  <div id="app" :class="{ 'dark': darkMode }">
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <!-- Layout for authenticated pages -->
      <AppLayout v-if="isAuthenticated" />
      
      <!-- Router View for non-authenticated pages -->
      <router-view v-else />
      
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
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import ChatWidget from './components/Chat/ChatWidget.vue'
import AppLayout from './components/Layout/AppLayout.vue'

export default {
  name: 'App',
  components: {
    ChatWidget,
    AppLayout
  },
  setup() {
    const store = useStore()

    const darkMode = computed(() => store.getters['ui/darkMode'])
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

    onMounted(() => {
      // Initialize dark mode from localStorage
      const savedDarkMode = localStorage.getItem('darkMode') === 'true'
      if (savedDarkMode !== darkMode.value) {
        store.dispatch('ui/setDarkMode', savedDarkMode)
      }
    })

    return {
      darkMode,
      isAuthenticated
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
