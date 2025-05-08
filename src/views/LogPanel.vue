<template>
  <div class="log_panel">
    <strong class="log_title">{{ log_title }}</strong>
    <!-- Loop for each group -->
    <div v-for="(group, groupIndex) in groupedLogs" :key="groupIndex" class="log_entry">
      <!-- Logs in each group are displayed on separate lines. -->
      <div v-for="(item, itemIndex) in group" :key="itemIndex">
        <BoldedText :text="item" /><br />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, defineComponent, h } from 'vue'

const props = defineProps<{
  logs: string[]
  front_msg_lang: string
}>()

//Assistant's message
let log_title = ref('')
if (props.front_msg_lang !== undefined) {
  const LOG_TITLE =
    props.front_msg_lang.toLowerCase() === 'ja'
      ? 'AI Agentの思考過程'
      : 'AI Agent’s Thought Process'
  log_title.value = LOG_TITLE
}

/**
 * Group logs using the empty string "" as a separator
 */
const groupedLogs = computed(() => {
  const groups: string[][] = []
  let currentGroup: string[] = []

  for (const log of props.logs) {
    if (log.trim() === '') {
      if (currentGroup.length > 0) {
        groups.push(currentGroup)
        currentGroup = []
      }
    } else {
      currentGroup.push(log)
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }
  return groups
})

/**
 * BoldedText component
 * Displays the part of the passed text enclosed in [ ] or < > with <strong>
 */
const BoldedText = defineComponent({
  name: 'BoldedText',
  props: {
    text: {
      type: String,
      required: true
    }
  },
  setup(props) {
    //Match [xxx] or <xxx> with regular expressions
    const parseText = (text: string) => {
      const regex = /(\[[^\]]+\]|<[^>]+>)/g
      //Split using regular expressions and remove empty strings
      const parts = text.split(regex).filter(Boolean)
      return parts.map((part, index) => {
        if (
          (part.startsWith('[') && part.endsWith(']')) ||
          (part.startsWith('<') && part.endsWith('>'))
        ) {
          return h('strong', { key: index }, part)
        }
        return part
      })
    }
    return () => h('span', parseText(props.text))
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap');

.log_panel {
  height: 80vh;
  overflow-y: auto;
  background: linear-gradient(135deg, #ffffff 0%, #c5f0e7 100%);
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
  line-height: 1.6;
  font-size: 0.8rem;
  font-family: 'Fira Code', 'Courier New', Courier, monospace;
}

.log_title {
  display: block;
  margin-bottom: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #333;
}

.log_entry {
  white-space: pre-wrap;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 8px 12px;
  margin: 8px 0;
  color: #333;
  word-break: break-word;
  opacity: 0;
  transform: translateY(30px);
  animation: floatUp 2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes floatUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
