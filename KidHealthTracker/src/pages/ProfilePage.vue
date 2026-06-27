<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLogsStore } from '@/stores/logs'
import { useProfileStore } from '@/stores/profile'
import { useToast } from '@/composables/useToast'

const auth = useAuthStore()
const logs = useLogsStore()
const profileStore = useProfileStore()
const router = useRouter()
const { success, error: showError } = useToast()

const loggingOut = ref(false)
const saving = ref(false)
const totalLogs = ref(0)
const childName = ref('')
const childBirthday = ref('')
const firstName = ref('')
const lastName = ref('')

const fullName = computed(() => {
  if (firstName.value && lastName.value) return `${firstName.value} ${lastName.value}`
  if (firstName.value) return firstName.value
  if (auth.user?.email) return auth.user.email.split('@')[0]
  return 'ผู้ใช้'
})

const email = computed(() => auth.user?.email || '')

const ageText = computed(() => {
  if (!childBirthday.value) return null
  const birth = new Date(childBirthday.value + 'T00:00:00')
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  let days = now.getDate() - birth.getDate()
  if (days < 0) {
    months--
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }
  if (years > 0) {
    return `${years} ปี ${months} เดือน`
  }
  if (months > 0) {
    return `${months} เดือน ${days} วัน`
  }
  return `${days} วัน`
})

onMounted(async () => {
  if (!auth.user) return
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  await logs.fetchMonth(y, m)
  totalLogs.value = Object.keys(logs.monthLogs).length
  const profile = await profileStore.fetchProfile()
  if (profile) {
    firstName.value = profile.first_name || ''
    lastName.value = profile.last_name || ''
    childName.value = profile.child_name || ''
    childBirthday.value = profile.child_birthday || ''
  }
})

async function handleSave() {
  saving.value = true
  try {
    await profileStore.updateProfile({
      child_name: childName.value,
      child_birthday: childBirthday.value || null,
    })
    success('บันทึกข้อมูลเรียบร้อย ✓')
  } catch (e) {
    showError(e.message || 'บันทึกไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

async function handleLogout() {
  loggingOut.value = true
  try {
    await auth.signOut()
    router.push('/login')
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <div class="page-shell">
    <header class="page-header">
      <div class="page-header__text">
        <span class="eyebrow">โปรไฟล์</span>
        <h1 class="t-page-heading">บัญชีของคุณ</h1>
      </div>
    </header>

    <section class="profile-card">
      <div class="profile-card__header">
        <div class="profile-avatar" aria-hidden="true">👩</div>
        <div>
          <p class="profile-card__name">{{ fullName }}</p>
          <p class="profile-card__email">{{ email || '—' }}</p>
        </div>
      </div>

      <div class="profile-card__body">
        <div class="profile-row">
          <span class="profile-row__icon" aria-hidden="true">👶</span>
          <label for="child-name" class="profile-row__label">ชื่อลูก</label>
          <input
            id="child-name"
            v-model="childName"
            type="text"
            class="input profile-row__input"
            placeholder="ชื่อลูกของคุณ"
          />
        </div>

        <div class="profile-row">
          <span class="profile-row__icon" aria-hidden="true">🎂</span>
          <label for="child-birthday" class="profile-row__label">วันเกิดลูก</label>
          <input
            id="child-birthday"
            v-model="childBirthday"
            type="date"
            class="input profile-row__input profile-row__input--date"
          />
        </div>

        <div v-if="ageText" class="profile-row profile-row--age">
          <span class="profile-row__icon" aria-hidden="true">📅</span>
          <span class="profile-row__label">อายุ</span>
          <span class="profile-row__value">{{ ageText }}</span>
        </div>

        <div class="profile-row">
          <span class="profile-row__icon" aria-hidden="true">📊</span>
          <span class="profile-row__label">บันทึกเดือนนี้</span>
          <span class="profile-row__value">{{ totalLogs }} วัน</span>
        </div>
      </div>
    </section>

    <button
      type="button"
      @click="handleSave"
      :disabled="saving"
      class="btn btn--primary"
    >
      {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
    </button>

    <div class="profile-logout">
      <button
        type="button"
        @click="handleLogout"
        :disabled="loggingOut"
        class="btn btn--danger"
      >
        {{ loggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.profile-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-subtle);
  overflow: hidden;
  margin-bottom: var(--space-5);
}

.profile-card__header {
  background: linear-gradient(135deg, #0EA5E9, #6366F1);
  color: #ffffff;
  padding: var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.profile-card__name {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
}

.profile-card__email {
  font-size: 13px;
  font-weight: 500;
  opacity: 0.9;
  margin: 2px 0 0;
}

.profile-card__body {
  padding: var(--space-3) var(--space-4);
}

.profile-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-subtle);
}

.profile-row:last-child {
  border-bottom: none;
}

.profile-row--age {
  border-bottom: 1px solid var(--color-border-subtle);
}

.profile-row__icon {
  font-size: 18px;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.profile-row__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  flex: 1;
  cursor: pointer;
}

.profile-row__value {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: right;
  white-space: nowrap;
}

.profile-row__input {
  max-width: 160px;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 600;
  text-align: right;
  border-radius: var(--radius-sm);
  min-height: 0;
}

.profile-row__input--date {
  max-width: 150px;
  appearance: none;
  -webkit-appearance: none;
}

.profile-logout {
  margin-top: var(--space-3);
}
</style>
