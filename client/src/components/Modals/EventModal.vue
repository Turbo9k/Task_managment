<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ event ? 'Edit Event' : 'Event Details' }}
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <!-- Event Details -->
        <div v-if="event" class="space-y-4">
          <div>
            <label class="label">Title</label>
            <input
              v-model="form.title"
              type="text"
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
              @click="$emit('close')"
              class="btn-outline"
            >
              Close
            </button>
            <button
              @click="saveEvent"
              class="btn-primary"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'

export default {
  name: 'EventModal',
  components: {
    X
  },
  props: {
    event: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const form = ref({
      title: '',
      description: '',
      date: '',
      time: '',
      priority: 'medium'
    })

    watch(() => props.event, (newEvent) => {
      if (newEvent) {
        form.value = {
          title: newEvent.title || '',
          description: newEvent.description || '',
          date: newEvent.date || '',
          time: newEvent.time || '',
          priority: newEvent.priority || 'medium'
        }
      }
    }, { immediate: true })

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
