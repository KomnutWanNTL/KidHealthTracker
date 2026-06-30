<script setup>
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div v-if="auth.isGuest" class="guest-banner" role="alert">
    <div class="guest-banner__content">
      <span class="guest-banner__icon" aria-hidden="true">🔒</span>
      <div class="guest-banner__text">
        <strong>โหมดทดลอง</strong>
        <span>ข้อมูลถูกบันทึกในเครื่องนี้เท่านั้น</span>
      </div>
      <router-link to="/register" class="guest-banner__cta">สมัครเพื่อบันทึกถาวร</router-link>
    </div>
  </div>
</template>

<style scoped>
.guest-banner {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
}

.guest-banner__content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.guest-banner__icon {
  font-size: 18px;
  flex-shrink: 0;
}

.guest-banner__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.guest-banner__text strong {
  font-size: 13px;
  color: #92400E;
}

.guest-banner__text span {
  font-size: 11px;
  color: #A16207;
}

.guest-banner__cta {
  font-size: 12px;
  font-weight: 700;
  color: #D97706;
  white-space: nowrap;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.guest-banner__cta:hover {
  color: #B45309;
}
</style>
