import { defineStore } from 'pinia'

/**
 * A function to store the CSRF Token in the pinia Store
 *
 * @example
 * import { useCsrfTokenStore } from '../store/csrf_token'
 *
 * const csrfTokenStore = useCsrfTokenStore()
 *
 * @returns {Object} - Pinia store with CSRF token
 */

export const useCsrfTokenStore = defineStore('csrf_token', {
  state: () => {
    return {
      csrf_token: ''
    } as {
      csrf_token: string
    }
  }
})
