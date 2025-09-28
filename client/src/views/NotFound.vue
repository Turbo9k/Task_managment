<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          Page not found
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sorry, we couldn't find the page you're looking for.
        </p>
      </div>

      <div class="space-y-4">
        <router-link
          to="/dashboard"
          class="btn-primary"
        >
          <Home class="h-4 w-4 mr-2" />
          Go to Dashboard
        </router-link>
        
        <button
          @click="$router.go(-1)"
          class="btn-outline"
        >
          <ArrowLeft class="h-4 w-4 mr-2" />
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Home, ArrowLeft } from 'lucide-vue-next'

export default {
  name: 'NotFound',
  components: {
    Home,
    ArrowLeft
  }
}
</script>
