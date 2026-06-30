<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLogsStore } from '@/stores/logs'
import { useProfileStore } from '@/stores/profile'
import { useToast } from '@/composables/useToast'
import { useDarkMode } from '@/composables/useDarkMode'
import { version } from '../../package.json'
import heic2any from 'heic2any'
import GuestBanner from '@/components/GuestBanner.vue'

const auth = useAuthStore()
const logs = useLogsStore()
const profileStore = useProfileStore()
const router = useRouter()
const { success, error: showError } = useToast()
const { isDark, toggle } = useDarkMode()

const loggingOut = ref(false)
const saving = ref(false)
const totalLogs = ref(0)
const streak = ref(0)
const childName = ref('')
const childBirthday = ref('')
const childGender = ref('')
const firstName = ref('')
const lastName = ref('')
const uploading = ref(false)
const fileInput = ref(null)

const avatarUrl = computed(() => profileStore.profile?.avatar_url || null)

const avatarFallback = computed(() => {
  if (childGender.value === 'male') return '👦'
  if (childGender.value === 'female') return '👧'
  return '👩'
})

const fullName = computed(() => {
  if (firstName.value && lastName.value) return `${firstName.value} ${lastName.value}`
  if (firstName.value) return firstName.value
  if (auth.user?.email) return auth.user.email.split('@')[0]
  return 'ผู้ใช้'
})

const email = computed(() => auth.user?.email || '')

const guestLogCount = computed(() => {
  if (!auth.isGuest) return 0
  const guestLogs = JSON.parse(localStorage.getItem('guestLogs') || '{}')
  const guestId = localStorage.getItem('guest_id')
  const logs = guestLogs[guestId]
  return logs ? Object.keys(logs).length : 0
})

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
  if (auth.isGuest) return
  if (!auth.user) return
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1
  await logs.fetchMonth(y, m)
  totalLogs.value = Object.keys(logs.monthLogs).length
  streak.value = await logs.getStreak()
  const profile = await profileStore.fetchProfile()
  if (profile) {
    firstName.value = profile.first_name || ''
    lastName.value = profile.last_name || ''
    childName.value = profile.child_name || ''
    childBirthday.value = profile.child_birthday || ''
    childGender.value = profile.child_gender || ''
  }
})

async function handleSave() {
  saving.value = true
  try {
    await profileStore.updateProfile({
      child_name: childName.value,
      child_birthday: childBirthday.value || null,
      child_gender: childGender.value || null,
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

function triggerFileInput() {
  fileInput.value?.click()
}

function compressImage(file, maxSize) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.naturalWidth
      let height = img.naturalHeight

      function tryQuality(quality) {
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('ไม่สามารถบีบอัดรูปได้')); return }
          if (blob.size <= maxSize) {
            resolve(blob)
          } else if (quality > 0.4) {
            tryQuality(quality - 0.1)
          } else {
            width = Math.round(width * 0.85)
            height = Math.round(height * 0.85)
            if (width >= 100 && height >= 100) {
              tryQuality(0.92)
            } else {
              reject(new Error('ไม่สามารถบีบอัดรูปให้ตํากว่า 700KB ได้'))
            }
          }
        }, 'image/jpeg', quality)
      }

      tryQuality(0.92)
    }
    img.onerror = () => reject(new Error('โหลดรูปไม่สำเร็จ'))
    const reader = new FileReader()
    reader.onload = (e) => { img.src = e.target.result }
    reader.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ'))
    reader.readAsDataURL(file)
  })
}

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    let fileToUpload = file

    if (file.type === 'image/heic' || file.type === 'image/heif') {
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 })
      fileToUpload = Array.isArray(converted) ? converted[0] : converted
    }

    if (fileToUpload.size > 700 * 1024) {
      fileToUpload = await compressImage(fileToUpload, 700 * 1024)
    }

    await profileStore.uploadAvatar(fileToUpload)
    success('อัปโหลดรูปโปรไฟล์เรียบร้อย ✓')
  } catch (e) {
    showError(e.message || 'อัปโหลดไม่สำเร็จ')
  } finally {
    uploading.value = false
    event.target.value = ''
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

    <GuestBanner />

    <template v-if="!auth.isGuest">
      <section class="profile-card">
        <div class="profile-card__header">
          <div class="profile-avatar-wrap" @click="triggerFileInput" role="button" tabindex="0" @keydown.enter="triggerFileInput" :title="uploading ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูปโปรไฟล์'">
            <img v-if="avatarUrl" :src="avatarUrl" alt="รูปโปรไฟล์" class="avatar-img" />
            <span v-else class="avatar-fallback" aria-hidden="true">{{ avatarFallback }}</span>
            <div class="avatar-overlay">
              <span v-if="uploading" class="avatar-overlay__text">กำลังอัปโหลด...</span>
              <span v-else class="avatar-overlay__icon">✏️</span>
            </div>
            <div v-if="uploading" class="avatar-spinner"></div>
          </div>
          <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/heic,image/heif" hidden @change="handleFileChange" />
          <div>
            <p class="profile-card__name">{{ fullName }}</p>
            <p class="profile-card__email">{{ email || '—' }}</p>
          </div>
        </div>

        <div class="child-info-card">
          <div class="child-info-row">
            <span class="child-info-row__icon" aria-hidden="true">👶</span>
            <label for="child-name" class="child-info-row__label">ชื่อเล่น</label>
            <input
              id="child-name"
              v-model="childName"
              type="text"
              class="input child-info-row__input"
              placeholder="ชื่อเล่นลูก"
            />
          </div>

          <div class="child-info-row">
            <span class="child-info-row__icon" aria-hidden="true">🎂</span>
            <label for="child-birthday" class="child-info-row__label">วันเกิด</label>
            <div class="child-info-row__right">
              <input
                id="child-birthday"
                v-model="childBirthday"
                type="date"
                :max="new Date().toISOString().split('T')[0]"
                class="input child-info-row__input"
              />
              <span v-if="ageText" class="child-info-row__age">{{ ageText }}</span>
            </div>
          </div>

          <div class="child-info-row child-info-row--last">
            <span class="child-info-row__icon" aria-hidden="true">⚤</span>
            <label id="child-gender-label" class="child-info-row__label">เพศ</label>
            <div class="child-info-row__gender" role="radiogroup" aria-labelledby="child-gender-label">
              <button
                type="button"
                role="radio"
                :aria-checked="childGender === 'female'"
                class="gender-pill"
                :class="{ 'gender-pill--active': childGender === 'female' }"
                @click="childGender = 'female'"
              >👧 หญิง</button>
              <button
                type="button"
                role="radio"
                :aria-checked="childGender === 'male'"
                class="gender-pill"
                :class="{ 'gender-pill--active': childGender === 'male' }"
                @click="childGender = 'male'"
              >👦 ชาย</button>
            </div>
          </div>
        </div>

        <div class="stats-section">
          <div class="stats-card stats-card--green">
            <div class="stats-card__label">📊 บันทึกเดือนนี้</div>
            <div class="stats-card__value">{{ totalLogs }}<span class="stats-card__unit"> วัน</span></div>
          </div>
          <div class="stats-card stats-card--blue">
            <div class="stats-card__label">🔥 ติดต่อกัน</div>
            <div class="stats-card__value">{{ streak }}<span class="stats-card__unit"> วัน</span></div>
          </div>
        </div>
      </section>

      <div class="dark-mode-toggle">
        <span class="dark-mode-toggle__label">🌙 โหมดมืด</span>
        <button
          type="button"
          role="switch"
          :aria-checked="isDark"
          class="toggle-switch"
          :class="{ 'toggle-switch--on': isDark }"
          @click="toggle"
        >
          <span class="toggle-switch__thumb"></span>
        </button>
      </div>

      <button
        type="button"
        @click="handleSave"
        :disabled="saving"
        class="btn btn--primary"
      >
        {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
      </button>

      <hr>

      <div class="profile-logout">
        <button
          type="button"
          @click="handleLogout"
          :disabled="loggingOut"
          class="btn btn--danger-outlined"
        >
          {{ loggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ' }}
        </button>
      </div>
    </template>

    <section v-else class="upgrade-card">
      <div class="upgrade-card__icon" aria-hidden="true">🔒</div>
      <h2 class="upgrade-card__title">บันทึกข้อมูลของคุณให้ถาวร</h2>
      <p class="upgrade-card__desc">
        คุณมีข้อมูล <strong>{{ guestLogCount }} รายการ</strong> ที่บันทึกไว้<br />
        สมัครสมาชิกเพื่อไม่ให้ข้อมูลสูญหาย
      </p>
      <router-link to="/register" class="btn btn--primary upgrade-card__cta">
        สมัครสมาชิก (คงข้อมูลเดิม)
      </router-link>
    </section>

    <p class="profile-version">เวอร์ชัน {{ version }}</p>
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

.profile-avatar-wrap {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.avatar-fallback {
  font-size: 24px;
  line-height: 1;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--motion-mid) ease;
  border-radius: var(--radius-full);
}

.profile-avatar-wrap:hover .avatar-overlay,
.profile-avatar-wrap:focus-visible .avatar-overlay {
  opacity: 1;
}

.avatar-overlay__text {
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  line-height: 1.3;
}

.avatar-overlay__icon {
  font-size: 16px;
  line-height: 1;
}

.avatar-spinner {
  position: absolute;
  inset: 2px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.profile-card__name {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
}

.profile-card__email {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.85;
  margin: 2px 0 0;
}

.child-info-card {
  padding: var(--space-1) var(--space-4);
}

.child-info-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border-subtle);
}

.child-info-row--last {
  border-bottom: none;
}

.child-info-row__icon {
  font-size: 18px;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.child-info-row__label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
}

.child-info-row__input {
  margin-left: auto;
  max-width: 160px;
  padding: 8px 10px;
  font-size: 15px;
  font-weight: 600;
  text-align: right;
  border-radius: var(--radius-sm);
  min-height: 0;
}

.child-info-row__right {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.child-info-row__age {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  white-space: nowrap;
}

.child-info-row__gender {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.gender-pill {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1.3;
}

.dark .gender-pill {
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

.gender-pill--active {
  background: #EFF6FF;
  border-color: #93C5FD;
  color: #0284C7;
}

.dark .gender-pill--active {
  background: #0C1F3F;
  border-color: #3B82F6;
  color: #93C5FD;
}

.stats-section {
  display: flex;
  gap: 10px;
  padding: var(--space-3) var(--space-4) var(--space-4);
}

.stats-card {
  flex: 1;
  padding: 14px 12px;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stats-card--green {
  background: #F0FDF4;
}

.dark .stats-card--green {
  background: #052E16;
}

.stats-card--blue {
  background: #EFF6FF;
}

.dark .stats-card--blue {
  background: #0C1F3F;
}

.stats-card__label {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
}

.stats-card--green .stats-card__label {
  color: #15803D;
}

.dark .stats-card--green .stats-card__label {
  color: #4ADE80;
}

.stats-card--blue .stats-card__label {
  color: #0369A1;
}

.dark .stats-card--blue .stats-card__label {
  color: #60A5FA;
}

.stats-card__value {
  font-size: 22px;
  font-weight: 800;
  line-height: 1.1;
}

.stats-card--green .stats-card__value {
  color: #15803D;
}

.dark .stats-card--green .stats-card__value {
  color: #4ADE80;
}

.stats-card--blue .stats-card__value {
  color: #0369A1;
}

.dark .stats-card--blue .stats-card__value {
  color: #60A5FA;
}

.stats-card__unit {
  font-size: 13px;
  font-weight: 600;
}

.upgrade-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-subtle);
  padding: 32px 24px 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.upgrade-card__icon {
  font-size: 48px;
}

.upgrade-card__title {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0;
}

.upgrade-card__desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.upgrade-card__cta {
  margin-top: var(--space-2);
}

hr {
  border: none;
  border-top: 1px solid var(--color-border-subtle);
  margin: var(--space-4) 0;
}

.profile-logout {
  margin-top: var(--space-3);
}

.profile-version {
  text-align: center;
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: var(--space-6);
  margin-bottom: var(--space-2);
}

.dark-mode-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin: var(--space-3) 0;
  border-top: 1px solid var(--color-border-subtle);
  border-bottom: 1px solid var(--color-border-subtle);
}

.dark-mode-toggle__label {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.toggle-switch {
  position: relative;
  width: 48px;
  height: 26px;
  border-radius: 13px;
  background: var(--color-border);
  border: none;
  cursor: pointer;
  transition: background-color var(--motion-mid) ease;
  padding: 0;
  flex-shrink: 0;
}

.toggle-switch--on {
  background: var(--color-primary);
}

.toggle-switch__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: var(--shadow-subtle);
  transition: transform var(--motion-mid) ease;
}

.toggle-switch--on .toggle-switch__thumb {
  transform: translateX(22px);
}
</style>
