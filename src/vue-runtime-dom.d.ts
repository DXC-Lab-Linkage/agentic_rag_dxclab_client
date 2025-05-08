// src/types/vue-runtime-dom.d.ts
/* eslint-disable vue/prefer-import-from-vue */
import type { Directive } from '@vue/runtime-dom'

declare module '@vue/runtime-dom' {
  interface Directives {
    [key: string]: Directive<unknown, unknown, string, string>
  }
}
