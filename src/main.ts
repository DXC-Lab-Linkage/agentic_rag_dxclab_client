import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './vuetify'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

/* CSP setting */
const meta = document.createElement('meta')
meta.httpEquiv = 'Content-Security-Policy'
meta.content =
  "default-src 'self'; style-src 'self'; style-src-elem 'self' https://fonts.googleapis.com 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=' 'sha256-HcB32D63QxbHF81G9ir4A4ZtfSFlntT1ZUYUPKNuzfI='; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline'; img-src 'self'; frame-src 'self'; connect-src 'self'"
document.head.appendChild(meta)

app.mount('#app')
