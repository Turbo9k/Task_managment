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
        // Simulate loading messages with more realistic content
        const mockMessages = [
          {
            id: 1,
            content: `Welcome to ${props.itemName} chat! 👋`,
            senderId: 'system',
            senderName: 'System',
            senderAvatar: null,
            timestamp: new Date(Date.now() - 300000) // 5 minutes ago
          },
          {
            id: 2,
            content: 'Hey team! How is everyone doing?',
            senderId: 'demo-user-1',
            senderName: 'Sarah Johnson',
            senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            timestamp: new Date(Date.now() - 240000) // 4 minutes ago
          },
          {
            id: 3,
            content: 'Great! Just finished the user authentication module 🎉',
            senderId: 'demo-user-2',
            senderName: 'Mike Chen',
            senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            timestamp: new Date(Date.now() - 180000) // 3 minutes ago
          },
          {
            id: 4,
            content: 'Awesome work Mike! The UI looks fantastic',
            senderId: 'demo-user-3',
            senderName: 'Emily Davis',
            senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            timestamp: new Date(Date.now() - 120000) // 2 minutes ago
          },
          {
            id: 5,
            content: 'Thanks! Ready for the next sprint planning?',
            senderId: 'demo-user-2',
            senderName: 'Mike Chen',
            senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            timestamp: new Date(Date.now() - 60000) // 1 minute ago
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
        
        // Generate realistic responses based on message content
        const responses = [
          "That sounds great! 👍",
          "I agree with that approach",
          "Let me know if you need any help with that",
          "Perfect! When do you think we can implement this?",
          "Nice work! 🚀",
          "I'll take a look at that and get back to you",
          "That's a good point, we should discuss this in the next meeting",
          "Awesome! Can't wait to see the results"
        ]
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        
        // Simulate response from different team members
        const teamMembers = [
          { name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
          { name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
          { name: 'Emily Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
          { name: 'Alex Rodriguez', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }
        ]
        
        const randomMember = teamMembers[Math.floor(Math.random() * teamMembers.length)]
        
        const response = {
          id: Date.now() + 1,
          content: randomResponse,
          senderId: `team-member-${Date.now()}`,
          senderName: randomMember.name,
          senderAvatar: randomMember.avatar,
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
      // Simulate realistic online users count
      onlineUsers.value = Math.floor(Math.random() * 8) + 2
      
      // Simulate online users changing over time
      const interval = setInterval(() => {
        const change = Math.random() > 0.5 ? 1 : -1
        onlineUsers.value = Math.max(1, onlineUsers.value + change)
      }, 10000)
      
      // Store interval ID for cleanup
      window.chatInterval = interval
    }

    const leaveChat = () => {
      onlineUsers.value = 0
      if (window.chatInterval) {
        clearInterval(window.chatInterval)
        window.chatInterval = null
      }
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
