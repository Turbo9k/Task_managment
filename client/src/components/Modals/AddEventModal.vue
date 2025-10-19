<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Add New Event
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="saveEvent" class="space-y-4">
          <div>
            <label class="label">Title</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="input"
              placeholder="Event title"
            />
          </div>

          <div>
            <label class="label">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="input"
              placeholder="Event description"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">Date</label>
              <input
                v-model="form.date"
                type="date"
                required
                class="input"
              />
            </div>
            <div>
              <label class="label">Time</label>
              <input
                v-model="form.time"
                type="time"
                class="input"
              />
            </div>
          </div>

          <div>
            <label class="label">Priority</label>
            <select v-model="form.priority" class="input">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
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
              class="btn-primary"
            >
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { X } from 'lucide-vue-next'

export default {
  name: 'AddEventModal',
  components: {
    X
  },
  props: {
    date: {
      type: String,
      required: true
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const form = ref({
      title: '',
      description: '',
      date: props.date,
      time: '',
      priority: 'medium'
    })

    onMounted(() => {
      // Set default time to current time
      const now = new Date()
      const timeString = now.toTimeString().slice(0, 5)
      form.value.time = timeString
    })

    const saveEvent = () => {
      emit('save', form.value)
    }

    return {
      form,
      saveEvent
    }
  }
}
</script>
