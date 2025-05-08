import { createRouter, createWebHistory } from 'vue-router'
import ChatBotView from '../views/ChatBotView.vue'
import SrvErrView from '../views/SrvErrView.vue'
import ErrView from '../views/ErrView.vue'
import GuidepageView from '../views/GuidepageView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ChatBotView
    },
    {
      //Server error
      path: '/srv_err',
      name: 'server error',
      component: SrvErrView
    },
    {
      //Error
      path: '/err',
      name: 'error',
      component: ErrView
    },
    {
      path: '/guide', //Route for the new page (change the path to guide-page)
      name: 'GuidePage', //Change the route name to GuidePage
      component: GuidepageView //Specify the GuidePage component you created
    }
  ]
})

export default router
