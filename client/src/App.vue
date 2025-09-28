<template>
  <div id="app">
    <h1>HELLO WORLD - VUE IS WORKING!</h1>
    <p>This is a test page</p>
    <button @click="testClick">Click Me</button>
    <p v-if="clicked">Button was clicked!</p>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'App',
  setup() {
    const clicked = ref(false)

    const testClick = () => {
      clicked.value = true
      console.log('Button clicked!')
    }

    return {
      clicked,
      testClick
    }
  }
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  padding: 20px;
  background-color: #f0f0f0;
  min-height: 100vh;
}

h1 {
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #0056b3;
}

p {
  color: #666;
  margin: 10px 0;
}
</style>
