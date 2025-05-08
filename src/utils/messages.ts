/**
 * Front‑end Message Utility
 *
 * This module centralizes all user‑facing text prompts for both Japanese (ja)
 * and English (en). It provides:
 *  1. A structured dictionary (`messages`) mapping language codes and keys
 *     to the actual string values.
 *  2. A single function, `getMessage`, which takes a message key and an
 *     optional language code (defaulting to the VITE_FRONT_MSG_LANG env
 *     variable) and returns the corresponding localized text.
 *
 * Usage:
 *   import { getMessage } from '@/utils/messages'
 *   const initPrompt = getMessage('AMSG_INIT')  // e.g. "Please input a question."
 */

/**
 * Supported language codes.
 */
export type Lang = 'ja' | 'en'

/**
 * Message definitions per language.
 * The outer key is the language code ('ja' | 'en'),
 * the inner key is the message identifier string.
 */
const messages: Record<Lang, Record<string, string>> = {
  ja: {
    AMSG_INIT: '質問または依頼を入力してください。',
    AMSG_ERR: 'エラーが発生しました。もう一度調査内容を入力してください。',
    EX_INP_MSG: '例) ～について調べてください。'
  },
  en: {
    AMSG_INIT: 'Please input a question or request.',
    AMSG_ERR: 'An unexpected error has occurred. Please enter the question again.',
    EX_INP_MSG: 'e.g.) Please research ~.'
  }
}

/**
 * Retrieve a front‑end message by its key for the given language.
 *
 * @param key   - The message identifier (e.g. 'AMSG_INIT').
 * @param lang  - Language code ('ja' or 'en'). Defaults to
 *                VITE_FRONT_MSG_LANG environment variable or 'en'.
 * @returns     - The corresponding message string, or empty string if not found.
 */
export function getMessage(key: string, lang: string): string {
  const selectedLang = lang === 'ja' ? 'ja' : 'en'
  return messages[selectedLang as Lang][key] ?? ''
}
