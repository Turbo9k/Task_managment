import { createApp } from 'vue'
import App from './App.vue'

console.log('Main.js loaded!')

// Create Vue app
const app = createApp(App)

console.log('Vue app created!')

// Mount app
app.mount('#app')

console.log('Vue app mounted!')
