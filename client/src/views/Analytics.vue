<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics 📊
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Track your productivity and project performance with detailed analytics.
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <select
            v-model="selectedPeriod"
            class="input w-40"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            @click="refreshData"
            class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center"
          >
            <RefreshCw class="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-xl flex items-center justify-center">
              <CheckSquare class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Completed</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ metrics.tasksCompleted }}</p>
            <p class="text-sm text-green-600 dark:text-green-400">+12% from last period</p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-xl flex items-center justify-center">
              <TrendingUp class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Productivity Score</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ metrics.productivityScore }}%</p>
            <p class="text-sm text-green-600 dark:text-green-400">+5% from last period</p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-xl flex items-center justify-center">
              <Clock class="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Task Time</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ metrics.avgTaskTime }}h</p>
            <p class="text-sm text-red-600 dark:text-red-400">-0.5h from last period</p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 rounded-xl flex items-center justify-center">
              <Target class="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Goal Achievement</p>
            <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ metrics.goalAchievement }}%</p>
            <p class="text-sm text-green-600 dark:text-green-400">+8% from last period</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Task Completion Trend -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Completion Trend</h3>
        <div class="h-64 flex items-center justify-center">
          <div class="text-center">
            <BarChart3 class="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400">Chart visualization would go here</p>
            <p class="text-sm text-gray-400 dark:text-gray-500">Integration with Chart.js or similar library</p>
          </div>
        </div>
      </div>

      <!-- Project Progress -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Progress</h3>
        <div class="space-y-4">
          <div v-for="project in projectProgress" :key="project.id" class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ project.name }}</span>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ project.progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${project.progress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Analytics -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Time Distribution -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Distribution</h3>
        <div class="space-y-3">
          <div v-for="category in timeDistribution" :key="category.name" class="flex items-center justify-between">
            <div class="flex items-center">
              <div
                class="w-4 h-4 rounded-full mr-3"
                :style="{ backgroundColor: category.color }"
              ></div>
              <span class="text-sm text-gray-900 dark:text-white">{{ category.name }}</span>
            </div>
            <span class="text-sm font-medium text-gray-900 dark:text-white">{{ category.hours }}h</span>
          </div>
        </div>
      </div>

      <!-- Team Performance -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Performance</h3>
        <div class="space-y-3">
          <div v-for="member in teamPerformance" :key="member.id" class="flex items-center justify-between">
            <div class="flex items-center">
              <img
                :src="member.avatar"
                :alt="member.name"
                class="w-8 h-8 rounded-full mr-3"
              />
              <span class="text-sm text-gray-900 dark:text-white">{{ member.name }}</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ member.tasks }} tasks</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ member.completion }}% completion</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div class="space-y-3">
          <div v-for="activity in recentActivity" :key="activity.id" class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div
                class="w-2 h-2 rounded-full mt-2"
                :class="activity.type === 'task' ? 'bg-blue-500' : 'bg-green-500'"
              ></div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900 dark:text-white">{{ activity.description }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { BarChart3, CheckSquare, TrendingUp, Clock, Target, RefreshCw } from 'lucide-vue-next'

export default {
  name: 'Analytics',
  components: {
    BarChart3,
    CheckSquare,
    TrendingUp,
    Clock,
    Target,
    RefreshCw
  },
  setup() {
    const store = useStore()

    const selectedPeriod = ref('30')
    const isLoading = ref(false)

    const metrics = ref({
      tasksCompleted: 47,
      productivityScore: 87,
      avgTaskTime: 2.3,
      goalAchievement: 92
    })

    const projectProgress = ref([
      { id: 1, name: 'Website Redesign', progress: 75 },
      { id: 2, name: 'Mobile App', progress: 45 },
      { id: 3, name: 'API Integration', progress: 90 },
      { id: 4, name: 'Database Migration', progress: 30 }
    ])

    const timeDistribution = ref([
      { name: 'Development', hours: 32, color: '#3B82F6' },
      { name: 'Design', hours: 18, color: '#10B981' },
      { name: 'Testing', hours: 12, color: '#F59E0B' },
      { name: 'Meetings', hours: 8, color: '#EF4444' },
      { name: 'Documentation', hours: 6, color: '#8B5CF6' }
    ])

    const teamPerformance = ref([
      { id: 1, name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', tasks: 23, completion: 95 },
      { id: 2, name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', tasks: 19, completion: 89 },
      { id: 3, name: 'Emily Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', tasks: 17, completion: 92 },
      { id: 4, name: 'Alex Rodriguez', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', tasks: 15, completion: 87 }
    ])

    const recentActivity = ref([
      { id: 1, type: 'task', description: 'Completed "User Authentication" task', time: '2 hours ago' },
      { id: 2, type: 'project', description: 'Updated "Website Redesign" project status', time: '4 hours ago' },
      { id: 3, type: 'task', description: 'Started "API Integration" task', time: '6 hours ago' },
      { id: 4, type: 'project', description: 'Created new "Mobile App" project', time: '1 day ago' },
      { id: 5, type: 'task', description: 'Completed "Database Schema" task', time: '2 days ago' }
    ])

    const refreshData = async () => {
      isLoading.value = true
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      isLoading.value = false
      // In a real app, this would fetch fresh data from the API
    }

    onMounted(() => {
      // Load initial analytics data
      refreshData()
    })

    return {
      selectedPeriod,
      isLoading,
      metrics,
      projectProgress,
      timeDistribution,
      teamPerformance,
      recentActivity,
      refreshData
    }
  }
}
</script>
