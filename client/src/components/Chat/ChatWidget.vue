<template>
  <div class="fixed bottom-4 right-4 z-50">
    <!-- Chat Toggle Button -->
    <button
      @click="toggleChat"
      class="w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-glow hover:shadow-glow-lg transition-all duration-300 transform hover:scale-110 animate-bounce-slow"
    >
      <MessageCircle v-if="!isOpen" class="h-6 w-6 mx-auto" />
      <X v-else class="h-6 w-6 mx-auto" />
    </button>

    <!-- Chat Window -->
    <div
      v-if="isOpen"
      class="absolute bottom-16 right-0 w-80 h-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-slide-up"
    >
      <!-- Chat Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-t-xl">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
            <MessageCircle class="h-4 w-4" />
          </div>
          <div>
            <h3 class="font-semibold">{{ chatTitle }}</h3>
            <p class="text-xs text-primary-100">{{ onlineUsers }} online</p>
          </div>
        </div>
        <button
          @click="toggleChat"
          class="text-white hover:text-primary-200 transition-colors duration-200"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Messages Area -->
      <div
        ref="messagesContainer"
        class="flex-1 p-4 space-y-3 overflow-y-auto h-64 scrollbar-hide"
      >
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex"
          :class="message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-xs px-3 py-2 rounded-lg"
            :class="[
              message.senderId === currentUser?.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
            ]"
          >
            <div class="flex items-center space-x-2 mb-1">
              <img
                :src="message.senderAvatar || defaultAvatar"
                :alt="message.senderName"
                class="w-4 h-4 rounded-full"
              />
              <span class="text-xs font-medium">{{ message.senderName }}</span>
            </div>
            <p class="text-sm">{{ message.content }}</p>
            <p class="text-xs opacity-70 mt-1">{{ formatTime(message.timestamp) }}</p>
          </div>
        </div>
        
        <!-- Typing Indicator -->
        <div v-if="isTyping" class="flex justify-start">
          <div class="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex space-x-2">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Type a message..."
            class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            :disabled="isLoading"
          />
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim() || isLoading"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Send class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { MessageCircle, X, Send } from 'lucide-vue-next'

export default {
  name: 'ChatWidget',
  components: {
    MessageCircle,
    X,
    Send
  },
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['task', 'project', 'global'].includes(value)
    },
    itemId: {
      type: [String, Number],
      required: true
    },
    itemName: {
      type: String,
      default: 'Item'
    }
  },
  setup(props) {
    const store = useStore()
    
    const isOpen = ref(false)
    const newMessage = ref('')
    const messages = ref([])
    const isLoading = ref(false)
    const isTyping = ref(false)
    const onlineUsers = ref(0)
    const messagesContainer = ref(null)

    const currentUser = computed(() => store.getters['auth/user'])
    const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'

    const chatTitle = computed(() => {
      return `${props.itemName} Chat`
    })

    const toggleChat = () => {
      isOpen.value = !isOpen.value
      if (isOpen.value) {
        loadMessages()
        joinChat()
      } else {
        leaveChat()
      }
    }

    const loadMessages = async () => {
      try {
        isLoading.value = true
        // Simulate loading messages
        const mockMessages = [
          {
            id: 1,
            content: `Welcome to ${props.itemName} chat!`,
            senderId: 'system',
            senderName: 'System',
            senderAvatar: null,
            timestamp: new Date(Date.now() - 60000)
          },
          {
            id: 2,
            content: 'This is a demo message for collaboration.',
            senderId: 'demo-user',
            senderName: 'Demo User',
            senderAvatar: defaultAvatar,
            timestamp: new Date(Date.now() - 30000)
          }
        ]
        messages.value = mockMessages
        scrollToBottom()
      } catch (error) {
        console.error('Failed to load messages:', error)
      } finally {
        isLoading.value = false
      }
    }

    const sendMessage = async () => {
      if (!newMessage.value.trim() || isLoading.value) return

      const message = {
        id: Date.now(),
        content: newMessage.value,
        senderId: currentUser.value?.id || 'demo-user',
        senderName: currentUser.value?.name || 'Demo User',
        senderAvatar: currentUser.value?.avatar || defaultAvatar,
        timestamp: new Date()
      }

      messages.value.push(message)
      newMessage.value = ''
      
      // Simulate typing indicator
      isTyping.value = true
      setTimeout(() => {
        isTyping.value = false
        // Simulate response
        const response = {
          id: Date.now() + 1,
          content: 'Thanks for your message! This is a demo response.',
          senderId: 'other-user',
          senderName: 'Team Member',
          senderAvatar: defaultAvatar,
          timestamp: new Date()
        }
        messages.value.push(response)
        scrollToBottom()
      }, 2000)

      scrollToBottom()
    }

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }

    const joinChat = () => {
      onlineUsers.value = Math.floor(Math.random() * 5) + 1
      // In a real app, this would connect to a WebSocket
    }

    const leaveChat = () => {
      onlineUsers.value = 0
      // In a real app, this would disconnect from WebSocket
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

    onMounted(() => {
      // Initialize chat if needed
    })

    onUnmounted(() => {
      leaveChat()
    })

    return {
      isOpen,
      newMessage,
      messages,
      isLoading,
      isTyping,
      onlineUsers,
      messagesContainer,
      currentUser,
      defaultAvatar,
      chatTitle,
      toggleChat,
      sendMessage,
      formatTime
    }
  }
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
