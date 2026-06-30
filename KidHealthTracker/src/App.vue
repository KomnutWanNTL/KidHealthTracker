<script setup>
import { useAuthStore } from '@/stores/auth'
import ToastContainer from '@/components/ToastContainer.vue'
import BottomNav from '@/components/BottomNav.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const auth = useAuthStore()
const route = useRoute()

const showBottomNav = computed(() =>
  (auth.session || auth.isGuest) && ['Dashboard', 'Summary', 'Profile'].includes(route.name),
)
</script>

<template>
  <ToastContainer />
  <div v-if="!auth.loading" id="app-root">
    <router-view />
    <BottomNav v-if="showBottomNav" />
  </div>
  <div v-else class="app-loading">
    <p class="app-loading__text">กำลังโหลด...</p>
  </div>
</template>

<style scoped>
.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-bg);
}

.app-loading__text {
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 600;
}
</style>
