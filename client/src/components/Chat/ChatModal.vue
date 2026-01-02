<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click.self="closeModal"
  >
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <MessageCircle class="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-white">{{ chatTitle }}</h3>
                <p class="text-sm text-primary-100">{{ onlineUsers }} members online</p>
              </div>
            </div>
            <button
              @click="closeModal"
              class="text-white hover:text-primary-200 transition-colors duration-200"
            >
              <X class="h-6 w-6" />
            </button>
          </div>
        </div>

        <!-- Chat Content -->
        <div class="flex h-96">
          <!-- Messages Area -->
          <div class="flex-1 flex flex-col">
            <!-- Messages List -->
            <div
              ref="messagesContainer"
              class="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-hide"
            >
              <div
                v-for="message in messages"
                :key="message.id"
                class="flex"
                :class="message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-md px-4 py-3 rounded-2xl"
                  :class="[
                    message.senderId === currentUser?.id
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                  ]"
                >
                  <div class="flex items-center space-x-2 mb-2">
                    <img
                      :src="message.senderAvatar || defaultAvatar"
                      :alt="message.senderName"
                      class="w-6 h-6 rounded-full"
                    />
                    <span class="text-sm font-medium">{{ message.senderName }}</span>
                    <span class="text-xs opacity-70">{{ formatTime(message.timestamp) }}</span>
                  </div>
                  <p class="text-sm">{{ message.content }}</p>
                </div>
              </div>
              
              <!-- Typing Indicator -->
              <div v-if="isTyping" class="flex justify-start">
                <div class="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md">
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
              <div class="flex space-x-3">
                <input
                  v-model="newMessage"
                  @keyup.enter="sendMessage"
                  type="text"
                  placeholder="Type your message..."
                  class="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  :disabled="isLoading"
                />
                <button
                  @click="sendMessage"
                  :disabled="!newMessage.trim() || isLoading"
                  class="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  <Send class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="w-64 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <!-- Online Members -->
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Online Members</h4>
              <div class="space-y-2">
                <div
                  v-for="member in onlineMembers"
                  :key="member.id"
                  class="flex items-center space-x-2"
                >
                  <div class="relative">
                    <img
                      :src="member.avatar || defaultAvatar"
                      :alt="member.name"
                      class="w-8 h-8 rounded-full"
                    />
                    <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ member.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ member.role }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="p-4">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
              <div class="space-y-2">
                <button
                  @click="shareFile"
                  class="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                >
                  <Paperclip class="h-4 w-4 mr-2" />
                  Share File
                </button>
                <button
                  @click="startVideoCall"
                  class="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                >
                  <Video class="h-4 w-4 mr-2" />
                  Video Call
                </button>
                <button
                  @click="shareScreen"
                  class="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                >
                  <Monitor class="h-4 w-4 mr-2" />
                  Share Screen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { MessageCircle, X, Send, Paperclip, Video, Monitor } from 'lucide-vue-next'

export default {
  name: 'ChatModal',
  components: {
    MessageCircle,
    X,
    Send,
    Paperclip,
    Video,
    Monitor
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      required: true,
      validator: (value) => ['task', 'project'].includes(value)
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
  emits: ['close'],
  setup(props, { emit }) {
    const store = useStore()
    
    const newMessage = ref('')
    const messages = ref([])
    const isLoading = ref(false)
    const isTyping = ref(false)
    const onlineUsers = ref(0)
    const onlineMembers = ref([])
    const messagesContainer = ref(null)

    const currentUser = computed(() => store.getters['auth/user'])
    const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'

    const chatTitle = computed(() => {
      return `${props.itemName} Discussion`
    })

    const closeModal = () => {
      emit('close')
    }

    const loadMessages = async () => {
      try {
        isLoading.value = true
        // Simulate loading messages
        const mockMessages = [
          {
            id: 1,
            content: `Welcome to the ${props.itemName} discussion! Let's collaborate and share ideas.`,
            senderId: 'system',
            senderName: 'System',
            senderAvatar: null,
            timestamp: new Date(Date.now() - 300000)
          },
          {
            id: 2,
            content: 'I think we should focus on the core functionality first.',
            senderId: 'user',
            senderName: 'User',
            senderAvatar: defaultAvatar,
            timestamp: new Date(Date.now() - 180000)
          },
          {
            id: 3,
            content: 'Great idea! What about the user interface design?',
            senderId: 'team-member',
            senderName: 'Team Member',
            senderAvatar: defaultAvatar,
            timestamp: new Date(Date.now() - 120000)
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

    const loadOnlineMembers = () => {
      onlineMembers.value = [
        {
          id: 'user',
          name: 'User',
          avatar: defaultAvatar,
          role: 'Admin'
        },
        {
          id: 'team-member-1',
          name: 'Sarah Johnson',
          avatar: defaultAvatar,
          role: 'Manager'
        },
        {
          id: 'team-member-2',
          name: 'Mike Chen',
          avatar: defaultAvatar,
          role: 'Developer'
        }
      ]
      onlineUsers.value = onlineMembers.value.length
    }

    const sendMessage = async () => {
      if (!newMessage.value.trim() || isLoading.value) return

      const message = {
        id: Date.now(),
        content: newMessage.value,
        senderId: currentUser.value?.id || 'user',
        senderName: currentUser.value?.name || 'User',
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
          content: 'That sounds good! Let me know if you need any help.',
          senderId: 'team-member',
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

    const shareFile = () => {
      // Implement file sharing
      console.log('Share file functionality')
    }

    const startVideoCall = () => {
      // Implement video call
      console.log('Start video call functionality')
    }

    const shareScreen = () => {
      // Implement screen sharing
      console.log('Share screen functionality')
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
      if (props.isOpen) {
        loadMessages()
        loadOnlineMembers()
      }
    })

    return {
      newMessage,
      messages,
      isLoading,
      isTyping,
      onlineUsers,
      onlineMembers,
      messagesContainer,
      currentUser,
      defaultAvatar,
      chatTitle,
      closeModal,
      sendMessage,
      shareFile,
      startVideoCall,
      shareScreen,
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
