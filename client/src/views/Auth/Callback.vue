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
        console.log('=== Callback Component Mounted ===')
        console.log('Current URL:', window.location.href)
        
        // Get token from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        
        console.log('Token from URL:', token ? 'Found' : 'Not found')

        if (!token) {
          console.error('No token found in URL')
          router.push('/login?error=no_token')
          return
        }

        console.log('Processing social login with token...')
        
        // Handle social login with token
        const result = await store.dispatch('auth/socialLogin', {
          provider: 'social',
          token
        })

        console.log('Social login result:', result)

        // Wait a moment for state to update
        await new Promise(resolve => setTimeout(resolve, 100))

        // Verify auth state
        const isAuthenticated = store.getters['auth/isAuthenticated']
        const hasUser = store.getters['auth/user']
        const hasToken = store.getters['auth/token']

        console.log('Auth state after login:', { isAuthenticated, hasUser: !!hasUser, hasToken: !!hasToken })

        if (result && result.success && isAuthenticated && hasUser) {
          console.log('Login successful, redirecting to dashboard')
          // Use replace to prevent back button issues
          router.replace('/dashboard')
        } else {
          console.error('Social login failed or auth state invalid:', { result, isAuthenticated, hasUser, hasToken })
          router.replace('/login?error=social_login_failed')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        console.error('Error details:', error.response || error.message)
        router.replace('/login?error=callback_failed')
      }
    })

    return {}
  }
}
</script>
