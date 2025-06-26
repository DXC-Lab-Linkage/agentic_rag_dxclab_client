import { defineStore } from 'pinia'
import axios from 'axios'
import { useCsrfTokenStore } from './csrf_token'
import router from '../router'

export const useConfigStore = defineStore('config', {
  state: () => {
    return {
      chat_id: '',
      FRONT_MSG_LANG: 'JA'
    } as {
      chat_id: string
      FRONT_MSG_LANG: string
    }
  },
  actions: {
    reset() {},
    async initChatId() {
      try {
        /* Get parameters */
        const postData = {}
        const csrfTokenStore = useCsrfTokenStore()
        const res_param = await axios({
          url: '/api/get_chat_id',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfTokenStore.csrf_token
          },
          data: postData
        })
        this.chat_id = res_param.data.chat_id
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          //Delete the localStorage token and move to the root screen
          localStorage.removeItem('token')
          router.push('/')
        } else if (axios.isAxiosError(error) && error.response?.status === 500) {
          //Delete the localStorage token and transition to the server error screen
          localStorage.removeItem('token')
          router.push('/srv_err')
          return
        } else {
          //Delete the localStorage token and transition to an error screen
          localStorage.removeItem('token')
          router.push('/err')
          return
        }
      }
    },
    async getConfig() {
      try {
        /* Get parameters */
        const res_param = await axios({
          url: '/api/get_param',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        this.FRONT_MSG_LANG = res_param.data.FRONT_MSG_LANG
        const csrfTokenStore = useCsrfTokenStore()
        /* Get CSRF token */
        const res_csrf = await axios({
          url: '/api/get_csrf',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const { data } = res_csrf
        csrfTokenStore.csrf_token = data.csrf_token
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          //Delete the localStorage token and move to the root screen
          localStorage.removeItem('token')
          router.push('/')
        } else if (axios.isAxiosError(error) && error.response?.status === 500) {
          //Delete the localStorage token and transition to the server error screen
          localStorage.removeItem('token')
          router.push('/srv_err')
          return
        } else {
          //Delete the localStorage token and transition to an error screen
          localStorage.removeItem('token')
          router.push('/err')
          return
        }
      }
    }
  }
})
