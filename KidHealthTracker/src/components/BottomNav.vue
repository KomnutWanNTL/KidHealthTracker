<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const tabs = [
  { name: 'Dashboard', label: 'บันทึก', icon: '📝', path: '/dashboard' },
  { name: 'Summary', label: 'สรุปเดือน', icon: '📅', path: '/summary' },
  { name: 'Profile', label: 'โปรไฟล์', icon: '👤', path: '/profile' },
]

const currentName = computed(() => route.name)

function go(tab) {
  if (route.path !== tab.path) router.push(tab.path)
}
</script>

<template>
  <nav class="bottom-nav" aria-label="เมนูหลัก">
    <button
      v-for="tab in tabs"
      :key="tab.name"
      type="button"
      :class="['bottom-nav__item', { 'bottom-nav__item--active': currentName === tab.name }]"
      :aria-current="currentName === tab.name ? 'page' : undefined"
      @click="go(tab)"
    >
      <span class="bottom-nav__icon" aria-hidden="true">{{ tab.icon }}</span>
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>
