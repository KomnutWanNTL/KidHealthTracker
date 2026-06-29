<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLogsStore } from '@/stores/logs'
import { useProfileStore } from '@/stores/profile'
import { useToast } from '@/composables/useToast'
import { version } from '../../package.json'

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
    const fileToUpload = file.size > 700 * 1024
      ? await compressImage(file, 700 * 1024)
      : file
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

    <section class="profile-card">
      <div class="profile-card__header">
        <div class="profile-avatar-wrap" @click="triggerFileInput" role="button" tabindex="0" @keydown.enter="triggerFileInput" :title="uploading ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูปโปรไฟล์'">
          <img v-if="avatarUrl" :src="avatarUrl" alt="รูปโปรไฟล์" class="avatar-img" />
          <span v-else class="avatar-fallback" aria-hidden="true">{{ avatarFallback }}</span>
          <div class="avatar-overlay">
            <span v-if="uploading" class="avatar-overlay__text">กำลังอัปโหลด...</span>
            <span v-else class="avatar-overlay__text">เปลี่ยน</span>
          </div>
          <div v-if="uploading" class="avatar-spinner"></div>
        </div>
        <input ref="fileInput" type="file" accept="image/jpeg,image/png" hidden @change="handleFileChange" />
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
            :max="new Date().toISOString().split('T')[0]"
            class="input profile-row__input profile-row__input--date"
          />
        </div>

        <div class="profile-row">
          <span class="profile-row__icon" aria-hidden="true">⚤</span>
          <label for="child-gender" class="profile-row__label">เพศลูก</label>
          <div class="profile-row__gender">
            <button
              type="button"
              class="gender-btn"
              :class="{ 'gender-btn--active': childGender === 'male' }"
              @click="childGender = 'male'"
            >👦 ชาย</button>
            <button
              type="button"
              class="gender-btn"
              :class="{ 'gender-btn--active': childGender === 'female' }"
              @click="childGender = 'female'"
            >👧 หญิง</button>
          </div>
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
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.avatar-fallback {
  font-size: 36px;
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
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  line-height: 1.3;
}

.avatar-spinner {
  position: absolute;
  inset: 3px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-secondary);
  flex: 1;
  cursor: pointer;
}

.profile-row__value {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  text-align: right;
  white-space: nowrap;
}

.profile-row__input {
  max-width: 160px;
  padding: 8px 10px;
  font-size: 16px;
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

.profile-row__gender {
  display: flex;
  gap: var(--space-2);
}

.gender-btn {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-border-subtle);
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.gender-btn--active {
  background: #0EA5E9;
  border-color: #0EA5E9;
  color: #fff;
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
</style>
