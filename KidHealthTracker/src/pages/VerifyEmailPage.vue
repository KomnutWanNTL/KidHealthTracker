<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'

const auth = useAuthStore()
const router = useRouter()
const waited = ref(false)

onMounted(async () => {
  if (auth.session) {
    router.push('/dashboard')
    return
  }
  setTimeout(() => {
    waited.value = true
  }, 4000)
})
</script>

<template>
  <main class="verify-shell">
    <div class="verify-card">
      <div class="verify-icon" aria-hidden="true">✉️</div>
      <p class="eyebrow verify-eyebrow">ยืนยันอีเมล</p>
      <h1 class="t-page-heading verify-title">กรุณาตรวจสอบอีเมลของคุณ</h1>
      <p class="verify-sub">คลิกลิงก์ในอีเมลเพื่อยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบอีกครั้ง</p>

      <button
        v-if="waited"
        type="button"
        class="btn btn--primary"
        @click="$router.push('/login')"
      >
        ไปหน้าเข้าสู่ระบบ
      </button>
    </div>
  </main>
</template>

<style scoped>
.verify-shell {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6) var(--space-4);
}

.verify-card {
  max-width: 360px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.verify-icon {
  font-size: 56px;
  margin-bottom: var(--space-2);
}

.verify-eyebrow {
  text-align: center;
}

.verify-title {
  color: var(--color-text-primary);
}

.verify-sub {
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: var(--space-3);
}
</style>
