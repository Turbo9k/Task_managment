<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Calendar 📅
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Manage your tasks and deadlines with our interactive calendar.
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <button
            @click="previousMonth"
            class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChevronLeft class="h-5 w-5" />
          </button>
          <button
            @click="goToToday"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Today
          </button>
          <button
            @click="nextMonth"
            class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChevronRight class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Calendar Controls -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ currentMonthYear }}
        </h2>
        <div class="flex items-center space-x-2">
          <button
            @click="viewMode = 'month'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium',
              viewMode === 'month' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            Month
          </button>
          <button
            @click="viewMode = 'week'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium',
              viewMode === 'week' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            Week
          </button>
          <button
            @click="viewMode = 'day'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium',
              viewMode === 'day' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            Day
          </button>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="card p-6">
      <!-- Month View -->
      <div v-if="viewMode === 'month'" class="space-y-4">
        <!-- Days of week header -->
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="day in daysOfWeek"
            :key="day"
            class="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar days -->
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            @click="selectDate(day.date)"
            :class="[
              'min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
              day.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900',
              day.isToday ? 'ring-2 ring-primary-500' : '',
              selectedDate && day.date === selectedDate ? 'bg-primary-50 dark:bg-primary-900/20' : ''
            ]"
          >
            <div class="flex items-center justify-between mb-2">
              <span
                :class="[
                  'text-sm font-medium',
                  day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500',
                  day.isToday ? 'text-primary-600 dark:text-primary-400' : ''
                ]"
              >
                {{ day.dayNumber }}
              </span>
              <button
                @click.stop="addEvent(day.date)"
                class="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <Plus class="h-4 w-4 text-gray-500" />
              </button>
            </div>
            
            <!-- Events for this day -->
            <div class="space-y-1">
              <div
                v-for="event in getEventsForDate(day.date)"
                :key="event.id"
                @click.stop="viewEvent(event)"
                :class="[
                  'text-xs p-1 rounded truncate cursor-pointer',
                  event.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                  event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                ]"
              >
                {{ event.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Week View -->
      <div v-else-if="viewMode === 'week'" class="space-y-4">
        <div class="grid grid-cols-8 gap-1">
          <div class="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            Time
          </div>
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {{ day.dayName }}<br>
            <span class="text-lg font-bold">{{ day.dayNumber }}</span>
          </div>
        </div>
        
        <div class="grid grid-cols-8 gap-1">
          <div class="space-y-1">
            <div
              v-for="hour in hours"
              :key="hour"
              class="h-12 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center"
            >
              {{ hour }}:00
            </div>
          </div>
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="min-h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg p-2"
          >
            <div
              v-for="event in getEventsForDate(day.date)"
              :key="event.id"
              @click="viewEvent(event)"
              :class="[
                'text-xs p-2 rounded cursor-pointer mb-1',
                event.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
              ]"
            >
              {{ event.title }}
            </div>
          </div>
        </div>
      </div>

      <!-- Day View -->
      <div v-else-if="viewMode === 'day'" class="space-y-4">
        <div class="text-center">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ formatDate(selectedDate || new Date()) }}
          </h3>
        </div>
        
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-2 space-y-1">
            <div
              v-for="hour in hours"
              :key="hour"
              class="h-12 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center"
            >
              {{ hour }}:00
            </div>
          </div>
          <div class="col-span-10">
            <div class="relative min-h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div
                v-for="event in getEventsForDate(selectedDate || new Date())"
                :key="event.id"
                @click="viewEvent(event)"
                :class="[
                  'p-3 rounded-lg cursor-pointer mb-2',
                  event.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                  event.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                ]"
              >
                <div class="font-medium">{{ event.title }}</div>
                <div class="text-sm opacity-75">{{ event.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Modal -->
    <EventModal v-if="showEventModal" :event="selectedEvent" @close="closeEventModal" @save="saveEvent" />

    <!-- Add Event Modal -->
    <AddEventModal v-if="showAddEventModal" :date="selectedDate" @close="closeAddEventModal" @save="addEvent" />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next'
import EventModal from '../components/Modals/EventModal.vue'
import AddEventModal from '../components/Modals/AddEventModal.vue'

export default {
  name: 'Calendar',
  components: {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    EventModal,
    AddEventModal
  },
  setup() {
    const store = useStore()

    const currentDate = ref(new Date())
    const selectedDate = ref(null)
    const viewMode = ref('month')
    const showEventModal = ref(false)
    const showAddEventModal = ref(false)
    const selectedEvent = ref(null)

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const hours = Array.from({ length: 24 }, (_, i) => i)

    const currentMonthYear = computed(() => {
      return currentDate.value.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    })

    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      const days = []
      const today = new Date()
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        
        days.push({
          date: date.toISOString().split('T')[0],
          dayNumber: date.getDate(),
          isCurrentMonth: date.getMonth() === month,
          isToday: date.toDateString() === today.toDateString()
        })
      }
      
      return days
    })

    const weekDays = computed(() => {
      const startOfWeek = new Date(selectedDate.value || currentDate.value)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - day
      const monday = new Date(startOfWeek.setDate(diff))
      
      const days = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday)
        date.setDate(monday.getDate() + i)
        days.push({
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: date.getDate()
        })
      }
      return days
    })

    const events = ref([
      {
        id: 1,
        title: 'Team Meeting',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        priority: 'high',
        description: 'Weekly team standup meeting'
      },
      {
        id: 2,
        title: 'Project Deadline',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '5:00 PM',
        priority: 'urgent',
        description: 'Final project submission deadline'
      },
      {
        id: 3,
        title: 'Code Review',
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        time: '2:00 PM',
        priority: 'medium',
        description: 'Review pull requests and provide feedback'
      }
    ])

    const getEventsForDate = (date) => {
      return events.value.filter(event => event.date === date)
    }

    const selectDate = (date) => {
      selectedDate.value = date
      if (viewMode.value === 'day') {
        // Already in day view, just update selected date
      }
    }

    const addEvent = (date) => {
      selectedDate.value = date
      showAddEventModal.value = true
    }

    const viewEvent = (event) => {
      selectedEvent.value = event
      showEventModal.value = true
    }

    const closeEventModal = () => {
      showEventModal.value = false
      selectedEvent.value = null
    }

    const closeAddEventModal = () => {
      showAddEventModal.value = false
    }

    const saveEvent = (eventData) => {
      if (selectedEvent.value) {
        // Update existing event
        const index = events.value.findIndex(e => e.id === selectedEvent.value.id)
        if (index !== -1) {
          events.value[index] = { ...events.value[index], ...eventData }
        }
      } else {
        // Add new event
        events.value.push({
          id: Date.now(),
          ...eventData
        })
      }
      closeEventModal()
    }

    const previousMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
    }

    const nextMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
    }

    const goToToday = () => {
      currentDate.value = new Date()
      selectedDate.value = new Date().toISOString().split('T')[0]
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    onMounted(() => {
      selectedDate.value = new Date().toISOString().split('T')[0]
    })

    return {
      currentDate,
      selectedDate,
      viewMode,
      showEventModal,
      showAddEventModal,
      selectedEvent,
      daysOfWeek,
      hours,
      currentMonthYear,
      calendarDays,
      weekDays,
      events,
      getEventsForDate,
      selectDate,
      addEvent,
      viewEvent,
      closeEventModal,
      closeAddEventModal,
      saveEvent,
      previousMonth,
      nextMonth,
      goToToday,
      formatDate
    }
  }
}
</script>
