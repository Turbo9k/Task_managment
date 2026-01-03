<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <div class="loading-spinner mx-auto mb-4 h-8 w-8"></div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Completing sign in...
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Please wait while we set up your account.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  name: 'AuthCallback',
  setup() {
    const store = useStore()
    const router = useRouter()

    onMounted(async () => {
      try {
        // Get token from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')

        console.log('Auth callback - token received:', token ? 'Yes' : 'No')

        if (token) {
          // Handle social login with token
          const result = await store.dispatch('auth/socialLogin', {
            provider: 'Google',
            token
          })

          console.log('Social login result:', result)

          if (result.success) {
            console.log('Redirecting to dashboard')
            router.push('/dashboard')
          } else {
            console.error('Social login failed:', result.error)
            router.push(`/login?error=social_login_failed&msg=${encodeURIComponent(result.error || 'Unknown error')}`)
          }
        } else {
          // No token found, redirect to login
          console.error('No token in URL')
          router.push('/login?error=no_token')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        })
        router.push(`/login?error=callback_failed&msg=${encodeURIComponent(error.message || 'Unknown error')}`)
      }
    })

    return {}
  }
}
</script>
