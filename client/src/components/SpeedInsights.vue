<template>
  <component :is="SpeedInsights" />
</template>

<script>
import { SpeedInsights } from '@vercel/speed-insights/vue'

export default {
  name: 'SpeedInsights',
  components: {
    SpeedInsights
  }
}
</script>
