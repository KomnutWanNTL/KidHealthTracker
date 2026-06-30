<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'กรุณากรอกอีเมลและรหัสผ่าน'
    return
  }
  loading.value = true
  const { error: err } = await auth.signIn(email.value, password.value)
  if (err) {
    error.value = err.message
    loading.value = false
  } else {
    router.push('/dashboard')
  }
}

function handleGuestMode() {
  auth.enterGuestMode()
  router.push('/dashboard')
}
</script>

<template>
  <main class="auth-shell">
    <div class="auth-card">
      <div class="auth-brand" aria-hidden="true">🏥</div>
      <p class="eyebrow auth-eyebrow">ยินดีต้อนรับกลับมา</p>
      <h1 class="t-display auth-title">KidHealth</h1>
      <p class="auth-subtitle">ติดตามสุขภาพลูกรายวัน</p>

      <form @submit.prevent="handleLogin" class="auth-form" novalidate>
        <div class="field">
          <label for="email" class="field__label">อีเมล</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            class="input"
            placeholder="you@example.com"
          />
        </div>

        <div class="field">
          <label for="password" class="field__label">รหัสผ่าน</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="input"
            placeholder="••••••••"
          />
        </div>

        <p v-if="error" class="field__error" role="alert">{{ error }}</p>

        <button type="submit" :disabled="loading" class="btn btn--primary">
          {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
        </button>

        <button
          type="button"
          class="btn btn--secondary"
          @click="$router.push('/register')"
        >
          สมัครสมาชิก
        </button>
      </form>

      <div class="auth-divider">
        <span>หรือ</span>
      </div>

      <button type="button" class="btn btn--ghost" @click="handleGuestMode">
        🚀 ทดลองใช้งาน
      </button>
      <p class="auth-guest-note">ไม่ต้องสมัครสมาชิก ข้อมูลถูกบันทึกในเครื่อง</p>

      <p class="auth-foot">
        ยังไม่มีบัญชี?
        <router-link to="/register" class="auth-link">สร้างบัญชีใหม่</router-link>
      </p>
    </div>
  </main>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6) var(--space-4);
}

.auth-card {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.auth-brand {
  font-size: 48px;
  text-align: center;
  margin-bottom: var(--space-3);
}

.auth-eyebrow {
  text-align: center;
}

.auth-title {
  text-align: center;
  color: var(--color-text-primary);
  margin: 4px 0 6px;
}

.auth-subtitle {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: var(--space-6);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-5) 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.auth-divider span {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.auth-guest-note {
  text-align: center;
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: var(--space-2);
}

.auth-foot {
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: var(--space-5);
}

.auth-link {
  color: var(--color-primary);
  font-weight: 700;
  margin-left: 4px;
}
</style>
