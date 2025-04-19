import './assets/css/main.css'
import './assets/css/transitions.scss'
import './assets/css/gsap-animations.scss'
import router from './router'

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(router)

if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.documentElement.classList.add('touch-device')
}

app.mount('#app')