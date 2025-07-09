<!-- eslint-disable no-irregular-whitespace -->
<template>
  <!-- Remove the default top margin in v-container by using pt-0, and set the margin in app-class -->
  <v-container v-if="show_screen == true" fluid class="pt-0">
    <div>
      <v-row>
        <v-col cols="12" lg="12" md="12" sm="12">
          <v-app class="app-class">
            <v-main>
              <v-row class="chatbot-container">
                <v-row>
                  <v-col cols="7">
                    <!-- chatbot name-->
                    <div class="chatbot-name">Agentic RAG Demo</div>
                  </v-col>
                  <v-col cols="5">
                    <div class="move-button">
                      <v-btn size="x-small" class="text-none" @click="openGuide">
                        <span class="mdi mdi-book-open-outline">&nbsp;User guide</span>
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
                <v-col cols="12">
                  <v-row>
                    <v-col cols="12" xs="12" sm="12" md="8" lg="8" xl="8">
                      <div class="chat-window">
                        <div
                          v-for="(message, index) in messages"
                          :key="index"
                          :class="[
                            'chat-message',
                            message.sender === 'User' ? 'user-message' : 'assistant-message'
                          ]"
                        >
                          <div v-if="message.sender === 'Assistant'" class="assistant-chat-name">
                            AI Agent
                          </div>
                          <v-card
                            class="mx-3 answer-area"
                            :class="{ 'agent-area': message.sender === 'Assistant' }"
                            style="position: relative"
                          >
                            <!-- User message -->
                            <div v-if="message.sender === 'User'" class="answer-text">
                              {{ message.text }}
                            </div>
                            <!-- Agent(Assistant) message + Copy button -->
                            <template v-if="message.sender === 'Assistant'">
                              <div style="display: flex; justify-content: flex-end">
                                <button
                                  v-if="index !== 0"
                                  class="copy-button"
                                  @click="copyText(message.text)"
                                  title="Copy"
                                >
                                  <span class="mdi mdi-content-copy"></span>
                                </button>
                              </div>
                              <div class="answer-text agent-text">
                                <div
                                  v-if="!md_area_fix"
                                  v-html="parseMarkdown(message.text)"
                                  class="md-area"
                                ></div>
                                <div
                                  v-else
                                  v-html="parseMarkdown(message.text)"
                                  class="md-area_fix"
                                ></div>
                              </div>
                            </template>
                          </v-card>
                        </div>
                      </div>
                    </v-col>
                    <v-col cols="4" md="4" lg="4" xl="4" class="hidden-sm-and-down">
                      <div>
                        <LogPanelView :logs="logs" :front_msg_lang="FRONT_MSG_LANG" />
                      </div>
                    </v-col>
                  </v-row>
                  <v-row class="text-center">
                    <v-col cols="12" xs="12" sm="12" md="8" lg="8" xl="8">
                      <div class="input-window">
                        <textarea
                          v-model="userInput"
                          @input="handleInput"
                          @keydown.enter="handleEnterKey"
                          :placeholder="EX_INP_MSG"
                          class="chat-input_te"
                          :disabled="disable_user_input"
                          ref="inputEl"
                          rows="1"
                          autocomplete=""
                        ></textarea>
                        <!-- Pop-up error message -->
                        <div v-if="showError" class="error-popup">
                          <p>
                            The maximum number of input characters is 5000 full-width characters.
                          </p>
                          <v-btn @click="closeErrorPopup" variant="text">[Close]</v-btn>
                        </div>
                        <!-- Submit button. Disabled if limit is exceeded -->
                        <v-btn
                          icon="mdi mdi-send"
                          color="primary"
                          variant="outlined"
                          @click="sendMessage"
                          class="send-button"
                          :disabled="disable_btn"
                          size="x-small"
                        />
                        <v-icon
                          class="upload-icon"
                          style="cursor: pointer; font-size: 24px; margin-left: 8px"
                          @click="onUploadClick"
                          title="Upload file"
                        >
                          mdi-file-upload-outline
                        </v-icon>
                        <input
                          ref="fileInput"
                          type="file"
                          accept=".txt,.md,.pdf"
                          style="display: none"
                          @change="onFileSelected"
                        />
                      </div>
                    </v-col>
                    <v-col cols="4" md="4" lg="4" xl="4" class="hidden-sm-and-down"></v-col>
                  </v-row>
                  <v-progress-linear
                    :indeterminate="progress_show"
                    color="grey"
                    class="progress-show"
                  ></v-progress-linear>
                </v-col>
              </v-row>
            </v-main>
          </v-app>
        </v-col>
      </v-row>
    </div>
  </v-container>
  <v-container v-else></v-container>
</template>
<!-- Reference: vuetify components: https://vuetifyjs.com/en/components/all/#containment -->
<!-- Reference: Material Design Icons https://pictogrammers.github.io/@mdi/font/7.4.47/ -->
<!-- Reference: Vuetify expansion panels -advanced https://vuetifyjs.com/en/components/expansion-panels/#advanced -->

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useConfigStore } from '../store/config'
import { useCsrfTokenStore } from '../store/csrf_token'
import { getMessage } from '../utils/messages'
import router from '../router'
import axios from 'axios'
import { nextTick } from 'vue'
import LogPanelView from './LogPanelView.vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { Router } from 'vue-router'
import { AxiosError } from 'axios'

const scrollToBottom = () => {
  const chatWindow = document.querySelector('.chat-window')
  if (chatWindow) {
    chatWindow.scrollTop = chatWindow.scrollHeight //Scroll window to end
  }
}

let logs = ref<string[]>([])
const progress_show = ref(false)
const configStore = useConfigStore()
const csrfTokenStore = useCsrfTokenStore()
const show_screen = ref(false)
const disable_btn = ref(false)
const disable_user_input = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

/**
 * Show User guide
 */
const openGuide = (): void => {
  window.open('/Guide', '_blank', 'noopener,noreferrer') //Go to '/Guide pageView' and open it in a new tab in your browser.
}
//Assistant's message
let AMSG_INIT = ''
let AMSG_ERR = ''
let EX_INP_MSG = ''
let FRONT_MSG_LANG = ''
let COPY_TEXT = ''
let COPY_TEXT_ERR = ''
const userInput = ref<string>('')
const md_area_fix = ref<boolean>(false)
//Error message display flag
const showError = ref(false)
//Maximum number of characters (5000 full-width characters)
const MAX_LENGTH: number = 5000

/**
 * Calculates the “byte length” of a string by counting full-width characters (including full-width spaces) as 1 byte
 * and half-width characters (including half-width spaces) as 0.5 bytes.
 *
 * @param str - The input string whose byte length is to be measured.
 * @returns The total byte length of the string based on the specified weights.
 */
function getByteLength(str: string): number {
  let count = 0
  const fullWidthRegex =
    /^[\u1100-\u115F\u2329\u232A\u2E80-\u303E\u3040-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE10-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6\u3000]$/

  for (const char of str) {
    if (fullWidthRegex.test(char)) {
      count += 1 //Full-width characters (including full-width spaces)
    } else {
      count += 0.5 //Half-width characters (including half-width spaces)
    }
  }
  return count
}

/**
 * Check character limit
 * @remarks If the character limit is exceeded, an error message will be displayed and the submit button will be disabled.
 *
 */
const checkTextLength = (): void => {
  const byteLength = getByteLength(userInput.value.trim())
  //If the character limit is exceeded
  if (byteLength > MAX_LENGTH) {
    showError.value = true //Show Error Message
    disable_btn.value = true // Disable the send button
  } else {
    showError.value = false
    if (byteLength === 0) {
      disable_btn.value = true
    } else {
      disable_btn.value = false
    }
  }
}

/**
 * A function to move the scroll position to the bottom after updating the log in the log panel
 *
 */
const LogscrollToBottom = () => {
  const LogPanelView = document.querySelector('.log_panel')
  if (LogPanelView) {
    LogPanelView.scrollTop = LogPanelView.scrollHeight
  }
}

/**
 * A function to adjust the height of the input field
 *
 */
const adjustHeight = (): void => {
  if (inputEl.value) {
    inputEl.value.style.height = 'auto' //Reset Height
    const scrollHeight = inputEl.value.scrollHeight
    const maxHeight = 5 * parseFloat(getComputedStyle(inputEl.value).lineHeight || '20') //Calculate the maximum height (for 5 rows)
    inputEl.value.style.height = `${Math.min(scrollHeight, maxHeight)}px` //Set it so that it does not exceed the maximum height
  }
}

//Organize into an array
const inputHandlers = [checkTextLength, adjustHeight]

/**
 * Executes all registered input handler functions.
 *
 * This function iterates over the `inputHandlers` array and invokes each handler callback.
 *
 * @returns void
 */
const handleInput = (): void => {
  inputHandlers.forEach((handler) => handler())
}

/**
 * Closes the error popup by hiding the error message.
 *
 * This function sets the `showError` reactive flag to `false`, causing the error popup to close.
 *
 * @returns void
 */
const closeErrorPopup = (): void => {
  showError.value = false
}

const messages = ref([
  {
    sender: 'Assistant',
    type: 'agent',
    text: AMSG_INIT //Assistant's message
  }
])

//Store chat data (also used to output chat logs)
let chat_data = {
  chat_id: '',
  user_request: '',
  answer: '',
  chat_start_date: ''
}

let status = ''
const turn = ref(1)
const inputEl = ref<HTMLInputElement | null>(null)
// Watch `inputEl` and set focus if reference changes
// Set focus if inputEl reference changes (keep focus continuously)
watch(
  inputEl,
  (newEl) => {
    if (newEl) {
      newEl.focus()
    }
  },
  { immediate: true } //Apply focus to initial value
)

/**
 * Attaches copy-to-clipboard handlers to all code copy buttons.
 *
 * This function finds all `<button>` elements with the
 * `.copy-code-button` class and a `data-copy-code` attribute,
 * removes the attribute to avoid registering duplicate events,
 * and adds a click listener that calls `copyCode` with the button.
 *
 * @returns void
 */
const addCopyEventListeners = () => {
  //Get buttons with data-copy-code attribute (type also specified)
  const buttons = document.querySelectorAll<HTMLButtonElement>('.copy-code-button[data-copy-code]')
  buttons.forEach((button) => {
    //Remove attributes to prevent duplicate events from being registered
    button.removeAttribute('data-copy-code')
    button.addEventListener('click', () => {
      copyCode(button)
    })
  })
}

onMounted(async () => {
  try {
    progress_show.value = true
    await configStore.getConfig()
    status = 'init'
    turn.value = 1
    //Messages to show
    FRONT_MSG_LANG = configStore.FRONT_MSG_LANG.toLowerCase()
    AMSG_INIT = getMessage('AMSG_INIT', FRONT_MSG_LANG)
    AMSG_ERR = getMessage('AMSG_ERR', FRONT_MSG_LANG)
    EX_INP_MSG = getMessage('EX_INP_MSG', FRONT_MSG_LANG)
    COPY_TEXT = getMessage('COPY_TEXT', FRONT_MSG_LANG)
    COPY_TEXT_ERR = getMessage('COPY_TEXT_ERR', FRONT_MSG_LANG)
    messages.value = [
      {
        sender: 'Assistant',
        type: 'agent',
        text: AMSG_INIT //Assistant's message
      }
    ]
    //Initializing chat_data
    await initChatData()
    //Perform initial processing
    await sendInit()
  } catch {
    show_screen.value = false
  } finally {
    show_screen.value = true
    progress_show.value = false
    //Always keep focus on inputEl
    await nextTick()
    if (inputEl.value) {
      inputEl.value.focus()
    }
  }
})

//Refocus even if status changes
watch(
  () => status,
  () => {
    if (inputEl.value) {
      inputEl.value.focus()
    }
  }
)

/**
 * Perform initial processing
 * @remarks
 */
const sendInit = async () => {
  try {
    //Output the first chat log
    disable_btn.value = true
    disable_user_input.value = true
    progress_show.value = true
    const res = await axios({
      url: '/api/start_chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfTokenStore.csrf_token
      }
    })
    chat_data.chat_start_date = res.data.chat_start_date
    //Clear the log displayed in the first chat panel.
    logs.value = []
    status = 'agent'
  } catch (error: unknown) {
    //For debugging
    handleError(error as AxiosError, router)
    return
  } finally {
    progress_show.value = false
    userInput.value = ''
    disable_user_input.value = false
    disable_btn.value = false
  }
}

/**
 * Calls a function to send a message according to the current state
 * @remarks
 * Selects the function to execute based on the state of the variable status
 * agent: Sends a message to the AI agent
 *
 */
const sendMessage = async () => {
  try {
    //Do nothing if user input is blank
    if (userInput.value.trim() === '' || userInput.value.trim().length > MAX_LENGTH) {
      return
    }
    //If you want to change the processing depending on the status, change it to a switch case statement.
    await sendMsgToAgent()
  } catch (error: unknown) {
    handleError(error as AxiosError, router)
    return
  } finally {
    progress_show.value = false
  }
}

/**
 * Handler for pressing Enter
 * - If the Shift key is pressed, do nothing to break the line, and allow the browser's default behavior (breaking the line)
 * - If the Shift key is not pressed, perform the submit action
 */
const handleEnterKey = (e: { shiftKey: unknown; preventDefault: () => void }) => {
  if (!e.shiftKey) {
    //If it is a single Enter, it will prevent a line break and execute the send process.
    e.preventDefault()
    sendMessage()
  }
  //Shift + Enter does nothing and the browser inserts a line break
}

/**
 * Send a message to the AI agent
 * @remarks
 */
const sendMsgToAgent = async () => {
  try {
    disable_btn.value = true
    disable_user_input.value = true
    progress_show.value = true
    //Add the user's initial message to the messages array
    messages.value.push({
      sender: 'User',
      type: 'user',
      text: userInput.value.trim()
    })
    await nextTick()
    scrollToBottom()
    chat_data.user_request = userInput.value.trim()
    const formData = new FormData()
    formData.append('chat_data', JSON.stringify(chat_data))
    if (selectedFile.value) {
      formData.append('file', selectedFile.value)
    }
    const response = await fetch('/api/ask_agent', {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': csrfTokenStore.csrf_token
      },
      body: formData
    })
    if (!response.ok) {
      //For HTTP errors, throw the error manually
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    if (!response.body) {
      console.error('Error: Stream not supported.')
      return
    }
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let partialData = ''
    let answer = ''
    let first_flg = true
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      interface MessageData {
        type: string
        content: string
      }
      partialData = decoder.decode(value, { stream: true })
      //Split at newlines and remove unnecessary blank lines
      const lines = partialData
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '')
        .map((line) => line)
      for (const line of lines) {
        //Strip the "data:" prefix if present
        const jsonLine = line.startsWith('data:') ? line.slice(5).trim() : line
        try {
          const message: MessageData = JSON.parse(jsonLine)
          if (message.type === 'msg') {
            /* Finally, the data with all the chunks concatenated is sent, and this is detected. */
            /* The data with " on both ends of the data with the chunks concatenated is the last data (excluding line breaks) */
            const answer_before =
              '"' +
              answer
                .replace(/\\n\\n/g, '')
                .replace(/\\n/g, '')
                .replace(/\n/g, '')
                .replace(/"/g, '"')
                .replace(/\\"/g, '"') +
              '"'
            const msg_content_nl = message.content
              .replace(/\\n\\n/g, '')
              .replace(/\\n/g, '')
              .replace(/\n/g, '')
              .replace(/"/g, '"')
              .replace(/\\"/g, '"')
            if (msg_content_nl !== answer_before) {
              //Not the last message, so join chunk to answer
              answer += message.content
                .replace(/\\n\\n/g, '\n')
                .replace(/\\n/g, '\n')
                .replace(/"/g, '"')
                .replace(/\\"/g, '"')
              if (first_flg === true) {
                if (answer.trim() != '') {
                  messages.value.push({
                    sender: 'Assistant',
                    text: answer,
                    type: 'agent'
                  })
                  first_flg = false
                }
              } else {
                if (answer.startsWith('"') && answer.endsWith('"')) {
                  answer = answer.slice(1, -1)
                }
                messages.value[messages.value.length - 1].text = answer
              }
              //Scroll to the bottom
              scrollToBottom()
            }
          } else if (message.type === 'update' || message.type === 'custom') {
            logs.value.push(message.content)
            nextTick(() => {
              LogscrollToBottom()
            })
          } else if (message.type === 'error') {
            messages.value.push({
              sender: 'Assistant',
              type: 'agent',
              text: AMSG_ERR
            })
            await nextTick()
            progress_show.value = false
            userInput.value = ''
            disable_user_input.value = false
            disable_btn.value = false
          } else if (message.type === 'final_msg') {
            if (answer.startsWith('"') && answer.endsWith('"')) {
              answer = answer.slice(1, -1)
            }
            messages.value[messages.value.length - 1].text = answer
            nextTick(() => {
              LogscrollToBottom()
            })
          }
        } catch (error: unknown) {
          handleError(error as AxiosError, router)
        }
      }
    }
    md_area_fix.value = true
    await nextTick()
    scrollToBottom()
    userInput.value = ''
    disable_user_input.value = false
    disable_btn.value = false
    //Focus on the question input field
    await nextTick()
    if (inputEl.value) {
      inputEl.value.focus()
    }
    //Enable Copy Code button
    await nextTick()
    addCopyEventListeners()
  } catch (error: unknown) {
    //For debugging
    handleError(error as AxiosError, router)
    return
  } finally {
    progress_show.value = false
    userInput.value = ''
    disable_user_input.value = false
    disable_btn.value = false
  }
}

/**
 * A function that transitions to an error screen depending on the error content
 *
 * @param error - Example: Axios error object, etc.
 * @param router - Router object for screen transitions
 */
const handleError = (error: AxiosError, router: Router): void => {
  if (error.response) {
    if (error.response.status === 401) {
      //Delete the localStorage token and move to the root screen
      localStorage.removeItem('token')
      router.push('/')
    } else if (error.response.status === 500) {
      //Delete the LocalStorage token and move to the server error screen.
      localStorage.removeItem('token')
      router.push('/srv_err')
    } else {
      //Delete the localStorage token and transition to an error screen
      localStorage.removeItem('token')
      router.push('/err')
    }
  } else {
    //Delete the localStorage token and transition to an error screen
    localStorage.removeItem('token')
    router.push('/err')
  }
  return
}

/**
 * Reset the chat_data value
 */
const initChatData = async () => {
  await configStore.initChatId()
  chat_data = {
    chat_id: configStore.chat_id,
    user_request: '',
    answer: '',
    chat_start_date: ''
  }
}
/** --- Show AI messages in Markdown format --- */

//Create and override the Renderer for marked
const renderer = new marked.Renderer()

/**
 * Renders a code block wrapped in a container with a “Copy” button.
 *
 * @param {Object} options
 * @param {string} options.text – The source code to display.
 * @param {string} [options.lang] – Optional language identifier for syntax highlighting (e.g., "js", "ts").
 * @returns {string} HTML string for the code block including a copy-to-clipboard button.
 */
renderer.code = ({ text, lang }) => {
  const languageClass = lang ? ` language-${lang}` : ''
  const buttonHTML = `<button class="copy-code-button" data-copy-code="true">Copy</button>`
  return `
    <div class="code-container">
      ${buttonHTML}
      <pre><code class="${languageClass}">${text}</code></pre>
    </div>
  `
}

/**
 * Renders an anchor (`<a>`) element with parsed inline text, opening in a new tab with security attributes.
 *
 * @param {Object} options - The link rendering options.
 * @param {string} options.href - The URL that the link points to.
 * @param {string} [options.title] - Optional title attribute for the link.
 * @param {Token[]} options.tokens - Array of token objects representing the link text.
 * @returns {string} HTML string for the link element with `target="_blank"` and `rel="noopener noreferrer"`.
 */
renderer.link = ({ href, title, tokens }) => {
  //Generate the text in the link based on the tokens array
  const text = marked.Parser.parseInline(tokens)
  //If there is a title attribute, add its value as an attribute
  const titleAttr = title ? ` title="${title}"` : ''
  //Add target="_blank" and a rel attribute to return a link
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
}

/**
 * Converts a Markdown-formatted string into sanitized HTML.
 *
 * This function uses a custom `renderer` with `marked.parse` to transform
 * the input Markdown into raw HTML, then applies `DOMPurify.sanitize`
 * (with `target` allowed) to ensure the output is safe for insertion into
 * the DOM.
 *
 * @param text - The Markdown text to be parsed and sanitized.
 * @returns A sanitized HTML string generated from the input Markdown.
 */
const parseMarkdown = (text: string): string => {
  //Convert Markdown to HTML by passing a custom renderer to the marked option
  const rawHTML = marked.parse(text, { renderer, async: false })
  //DOMPurify's local settings allow the target attribute as an additional attribute and sanitize it
  const sanitizedHTML = DOMPurify.sanitize(rawHTML, { ADD_ATTR: ['target'] })
  return sanitizedHTML
}

/**
 * Copies the text content of the sibling `<code>` element to the clipboard
 * and provides user feedback by temporarily changing the button label.
 *
 * @param button - The HTMLButtonElement that was clicked to trigger the copy.
 * @returns A Promise that resolves when the copy operation completes.
 */
const copyCode = async (button: HTMLButtonElement) => {
  const parent = button.parentElement
  if (!parent) return
  //Get the code element as an HTMLElement
  const codeElement = parent.querySelector('code') as HTMLElement | null
  if (!codeElement) return

  const codeText = codeElement.innerText //Use innerText

  try {
    await navigator.clipboard.writeText(codeText)
    button.innerText = 'Copied!'
    setTimeout(() => {
      button.innerText = 'Copy'
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

/**
 * Copies the provided text to the clipboard and shows an alert message
 * to notify the user of success or failure.
 *
 * @param text - The string to be copied to the clipboard.
 * @returns void
 */
const copyText = (text: string): void => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert(COPY_TEXT)
    })
    .catch(() => {
      alert(COPY_TEXT_ERR)
    })
}

/**
 * Triggers the hidden file input dialog when the upload icon is clicked.
 * This function should be bound to the click event of the upload icon.
 */
function onUploadClick() {
  fileInput.value?.click()
}

/**
 * Handles the file selection event from the file input element.
 * If a file is selected, it logs the file object and can trigger the upload process.
 *
 * @param {Event} event - The change event triggered when the user selects a file.
 */
async function onFileSelected(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}
</script>

<style scoped>
html {
  font-size: 100%;
}

.chatbot-container {
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #eaedf7;
  margin: 0 auto;
  max-width: 95%;
}

.chat-window {
  height: 80vh;
  max-height: 80vh;
  overflow-y: auto;
  padding-top: 10px;
  padding-left: 10px;
  padding-bottom: 10px;
  /* Borders and Drop Shadows */
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  /* Change background to gradient */
  background: linear-gradient(110deg, #ffffff 0%, #e0e9f9 100%);
  margin-right: 0 !important;
}

.input-window {
  width: 100%;
  display: flex;
  align-items: center;
}

.chat-message {
  margin-bottom: 10px;
  font-size: 0.8rem;
  color: #000000;
}

.user-message {
  justify-content: flex-end;
  text-align: left;
  display: flex;
}

.assistant-message {
  justify-content: flex-start;
  text-align: left;
  display: flex;
  flex-direction: column;
}

.chatbot-name {
  font-size: 0.9rem;
  font-weight: 600;
  background: linear-gradient(135deg, #0d5b9b, #7abcf1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 1px;
  margin: 3px 0px 0px 20px; /* 上:15px, 右:0, 下:15px, 左:20px */
  display: inline-block;
}

.move-button {
  display: flex;
  justify-content: flex-end;
  padding-top: 5px;
  padding-bottom: 1px;
  padding-left: 4px;
  padding-right: 4px;
  font-size: 6px;
  height: auto;
  min-width: 20px;
  line-height: 1.2;
}

.small-text {
  font-size: 10px;
}

.assistant-chat-name {
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 5px;
  text-align: left;
  padding-left: 5px;
}

.chat-input {
  width: 100%;
  height: 2rem;
  resize: none; /* Disable manual resizing */
  overflow-y: auto; /* hidden hides the scrollbar */
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px 0 0 5px;
  font-size: 0.8rem;
  box-sizing: border-box;
  margin-right: 5px;
}

.chat-input_te {
  width: 100%;
  height: 2.4rem;
  resize: none; /* Disable manual resizing */
  overflow-y: auto; /* hidden hides the scrollbar */
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px 0 0 5px;
  font-size: 0.8rem;
  box-sizing: border-box;
  margin-right: 5px;
}

.send-button {
  padding: 5px 5px;
}

.answer-area {
  font-size: 0.8rem;
  position: relative;
  padding: 10px;
  margin-bottom: 20px;
  width: 80%;
  background-color: rgb(230, 238, 250);
  white-space: pre-line;
  /* Reflect line breaks */
  /* Borders and drop shadows */
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  word-break: break-word;
  opacity: 0;
  transform: translateY(30px); /* Place below */
  animation: fadeIn 1s ease forwards;
}

/* Floating animation definition  */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.answer-text {
  opacity: 0;
  animation: textFadeIn 0.5s ease forwards;
  animation-delay: 0.2s; /* Display text after displaying card */
  padding-top: 0rem;
  padding-bottom: 0;
  margin-top: 0px;
  margin-bottom: 0px;
  padding-right: 1rem;
}

@keyframes textFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message .answer-area {
  /* Color for user messages */
  background-color: #b1eade;
  max-width: 50%;
}

.assistant-message .answer-area {
  background-color: #d1e8ff;
  /* Color for Assistant messages */
  display: inline-block;
  /* Wrap text if it gets too long */
  word-wrap: break-word;
  margin-top: -2rem;
}

.md-area {
  background-color: #d1e8ff;
  margin-bottom: -0.5rem;
}

.md-area_fix {
  background-color: #d1e8ff;
  margin-bottom: -0.5rem;
  max-height: 800px; /* Maximum height limited to 800px */
  overflow-y: auto; /* Automatically display vertical scrollbar */
}

.app-class {
  padding-top: 5px;
  margin-bottom: 1px;
  background-color: transparent;
}

.progress-show {
  margin-top: 0.2rem;
}

.error-popup {
  position: fixed;
  top: 60%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(144, 130, 130, 0.8);
  color: white;
  padding: 20px;
  border-radius: 5px;
  z-index: 1000;
}

/* Narrow line spacing for the entire document */
:deep(p) {
  margin-top: 0.1rem;
  margin-bottom: 0rem;
  line-height: 1rem; /* Narrow line spacing (usually 1.5 to 1.6) */
}

/* Adjust margins between headings */
:deep(h1),
:deep(h2) {
  margin-top: 0rem;
  margin-bottom: -1rem;
}

:deep(h3),
:deep(h4),
:deep(h5),
:deep(h6) {
  margin-top: 0.5rem; /* Be careful, if you reduce margin-top the top will be cut off */
  margin-bottom: -1.2rem; /* Adjust the vertical width with margin-bottom */
}

:deep(ul) {
  padding-top: 0rem;
  margin-top: -1rem;
  margin-bottom: -1.2rem;
  padding-left: 1.4rem;
  line-height: 1.4;
}

:deep(ol) {
  padding-top: 0rem;
  margin-top: -1.2rem;
  margin-bottom: -1.2rem;
  padding-left: 1.5rem;
  line-height: 1.4;
}

:deep(li) {
  margin-top: 0rem;
  margin-bottom: -1.2rem; /* Narrow the space between list items */
  line-height: 1.4rem;
}

/* Container for the entire code block */
:deep(.code-container) {
  position: relative;
  margin-top: -3rem;
  margin-bottom: -2rem;
}

:deep(.copy-code-button) {
  position: absolute;
  right: 20px;
  top: 0.5rem;
  z-index: 10;
  cursor: pointer;
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 2px 5px;
  border-radius: 2px;
  font-size: xx-small;
  box-shadow: 0 1px 2px rgba(43, 25, 25, 0.2);
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;
}

:deep(.copy-code-button:hover) {
  background-color: #0056b3; /* Slightly darker on mouse over */
  transform: translateY(-2px); /* Raise it slightly above */
}

:deep(.copy-code-button):active {
  transform: translateY(0); /* Return to original position when clicked */
}

/* Other Markdown styles */
:deep(pre) {
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  margin: 0.5em 0;
}

/* code element style */
:deep(code) {
  font-family: 'Fira Code', Consolas, Menlo, monospace;
  background-color: rgba(220, 220, 220, 0.5);
  padding: 4px 6px;
  border-radius: 4px;
}

:deep(blockquote) {
  border-left: 4px solid #2a7de1;
  margin-left: 0;
  padding-left: 16px;
  color: #2a7de1;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

/* Table style */
:deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  border: 2px solid #2a7de1;
  background-color: rgba(255, 255, 255, 0.9);
}

:deep(th),
:deep(td) {
  border: 1px solid #2a7de1;
  padding: 3px 8px;
  text-align: left;
  line-height: 1.2;
}

:deep(th) {
  background-color: #91c7ff;
  color: #000000;
  font-weight: bold;
}

:deep(tr:nth-child(even)) {
  background-color: rgba(255, 255, 255, 0.5);
}

:deep(tr:hover) {
  background-color: rgba(44, 140, 118, 0.2);
}

.copy-button {
  position: absolute;
  display: flex;
  justify-content: flex-end;
  z-index: 10;
}

.upload-icon:hover {
  color: #1976d2;
}
</style>
