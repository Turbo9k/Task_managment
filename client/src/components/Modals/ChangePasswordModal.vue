<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Change Password
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="label">Current Password</label>
            <input
              v-model="form.currentPassword"
              type="password"
              required
              class="input"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label class="label">New Password</label>
            <input
              v-model="form.newPassword"
              type="password"
              required
              class="input"
              placeholder="Enter new password"
              :class="{ 'border-red-500': passwordError }"
            />
            <p v-if="passwordError" class="text-red-500 text-xs mt-1">{{ passwordError }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Password must be at least 8 characters long
            </p>
          </div>

          <div>
            <label class="label">Confirm New Password</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              required
              class="input"
              placeholder="Confirm new password"
              :class="{ 'border-red-500': confirmPasswordError }"
            />
            <p v-if="confirmPasswordError" class="text-red-500 text-xs mt-1">{{ confirmPasswordError }}</p>
          </div>

          <!-- Password Strength Indicator -->
          <div v-if="form.newPassword" class="space-y-2">
            <div class="text-xs text-gray-500 dark:text-gray-400">Password strength:</div>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="passwordStrengthClass"
                :style="{ width: passwordStrength + '%' }"
              ></div>
            </div>
            <div class="text-xs" :class="passwordStrengthTextClass">
              {{ passwordStrengthText }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!isFormValid || isLoading"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div v-if="isLoading" class="loading-spinner mr-2"></div>
              {{ isLoading ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { X } from 'lucide-vue-next'

export default {
  name: 'ChangePasswordModal',
  components: {
    X
  },
  emits: ['close'],
  setup(_, { emit }) {
    const store = useStore()

    const form = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const isLoading = ref(false)
    const passwordError = ref('')
    const confirmPasswordError = ref('')

    const passwordStrength = computed(() => {
      const password = form.value.newPassword
      if (!password) return 0

      let strength = 0
      if (password.length >= 8) strength += 20
      if (password.length >= 12) strength += 20
      if (/[a-z]/.test(password)) strength += 20
      if (/[A-Z]/.test(password)) strength += 20
      if (/[0-9]/.test(password)) strength += 10
      if (/[^A-Za-z0-9]/.test(password)) strength += 10

      return strength
    })

    const passwordStrengthClass = computed(() => {
      const strength = passwordStrength.value
      if (strength < 40) return 'bg-red-500'
      if (strength < 70) return 'bg-yellow-500'
      return 'bg-green-500'
    })

    const passwordStrengthTextClass = computed(() => {
      const strength = passwordStrength.value
      if (strength < 40) return 'text-red-500'
      if (strength < 70) return 'text-yellow-500'
      return 'text-green-500'
    })

    const passwordStrengthText = computed(() => {
      const strength = passwordStrength.value
      if (strength < 40) return 'Weak'
      if (strength < 70) return 'Medium'
      return 'Strong'
    })

    const isFormValid = computed(() => {
      return form.value.currentPassword &&
             form.value.newPassword &&
             form.value.confirmPassword &&
             form.value.newPassword === form.value.confirmPassword &&
             form.value.newPassword.length >= 8 &&
             !passwordError.value &&
             !confirmPasswordError.value
    })

    const validatePassword = () => {
      passwordError.value = ''
      if (form.value.newPassword && form.value.newPassword.length < 8) {
        passwordError.value = 'Password must be at least 8 characters long'
      }
    }

    const validateConfirmPassword = () => {
      confirmPasswordError.value = ''
      if (form.value.confirmPassword && form.value.newPassword !== form.value.confirmPassword) {
        confirmPasswordError.value = 'Passwords do not match'
      }
    }

    const changePassword = async () => {
      validatePassword()
      validateConfirmPassword()

      if (!isFormValid.value) return

      isLoading.value = true

      try {
        const result = await store.dispatch('auth/changePassword', {
          currentPassword: form.value.currentPassword,
          newPassword: form.value.newPassword
        })

        if (result.success) {
          emit('close')
          // Reset form
          form.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }
      } catch (error) {
        console.error('Password change error:', error)
      } finally {
        isLoading.value = false
      }
    }

    return {
      form,
      isLoading,
      passwordError,
      confirmPasswordError,
      passwordStrength,
      passwordStrengthClass,
      passwordStrengthTextClass,
      passwordStrengthText,
      isFormValid,
      validatePassword,
      validateConfirmPassword,
      changePassword
    }
  }
}
</script>
