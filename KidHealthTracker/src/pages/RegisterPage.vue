<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const firstName = ref('')
const lastName = ref('')
const error = ref('')
const loading = ref(false)
const registered = ref(false)

async function handleRegister() {
  error.value = ''
  if (!firstName.value || !lastName.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'กรุณากรอกข้อมูลให้ครบทุกช่อง'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'รหัสผ่านไม่ตรงกัน'
    return
  }
  if (password.value.length < 8) {
    error.value = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'
    return
  }
  loading.value = true
  const { error: err } = await auth.signUp(email.value, password.value, {
    data: { first_name: firstName.value, last_name: lastName.value },
  })
  if (err) {
    error.value = err.message
    loading.value = false
  } else {
    registered.value = true
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-shell">
    <div v-if="!registered" class="auth-card">
      <p class="eyebrow auth-eyebrow">สร้างบัญชีใหม่</p>
      <h1 class="t-display auth-title">สมัครสมาชิก</h1>
      <p class="auth-subtitle">เริ่มติดตามอาการลูกวันนี้</p>

      <form @submit.prevent="handleRegister" class="auth-form" novalidate>
        <div class="field">
          <label for="first-name" class="field__label">ชื่อจริง</label>
          <input
            id="first-name"
            v-model="firstName"
            type="text"
            autocomplete="given-name"
            required
            class="input"
            placeholder="เช่น สมชาย"
          />
        </div>

        <div class="field">
          <label for="last-name" class="field__label">นามสกุล</label>
          <input
            id="last-name"
            v-model="lastName"
            type="text"
            autocomplete="family-name"
            required
            class="input"
            placeholder="เช่น ใจดี"
          />
        </div>

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
            autocomplete="new-password"
            required
            minlength="8"
            class="input"
            placeholder="อย่างน้อย 8 ตัวอักษร"
          />
        </div>

        <div class="field">
          <label for="confirm-password" class="field__label">ยืนยันรหัสผ่าน</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            required
            class="input"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
          />
        </div>

        <p v-if="error" class="field__error" role="alert">{{ error }}</p>

        <button type="submit" :disabled="loading" class="btn btn--primary">
          {{ loading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก' }}
        </button>

        <button
          type="button"
          class="btn btn--secondary"
          @click="$router.push('/login')"
        >
          กลับไปเข้าสู่ระบบ
        </button>
      </form>

      <p class="auth-foot">
        มีบัญชีอยู่แล้ว?
        <router-link to="/login" class="auth-link">เข้าสู่ระบบ</router-link>
      </p>
    </div>

    <div v-else class="auth-card auth-success">
      <div class="auth-brand" aria-hidden="true">✉️</div>
      <h1 class="t-page-heading auth-title">กรุณายืนยันอีเมล</h1>
      <p class="auth-subtitle">
        เราส่งลิงก์ยืนยันไปที่ <strong>{{ email }}</strong> แล้ว
      </p>
      <p class="auth-subtitle auth-subtitle--muted">
        เปิดอีเมลแล้วคลิกลิงก์เพื่อเริ่มใช้งาน
      </p>
      <button type="button" class="btn btn--secondary" @click="$router.push('/login')">
        กลับไปหน้าเข้าสู่ระบบ
      </button>
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
  margin-bottom: var(--space-3);
}

.auth-subtitle--muted {
  color: var(--color-text-muted);
  margin-bottom: var(--space-5);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
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

.auth-success {
  align-items: stretch;
  text-align: center;
}
</style>
