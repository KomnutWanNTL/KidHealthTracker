<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useLogsStore } from '@/stores/logs'
import { SYMPTOMS } from '@/constants/symptoms'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import SymptomCard from '@/components/SymptomCard.vue'
import GuestBanner from '@/components/GuestBanner.vue'

const logs = useLogsStore()
const auth = useAuthStore()
const profileStore = useProfileStore()
const { success, error: showError } = useToast()

const today = computed(() => new Date().toISOString().split('T')[0])
const selectedDate = ref(today.value)
const selectedSymptom = ref(null)
const saving = ref(false)

const greetingName = computed(() => {
  if (auth.isGuest) return 'ผู้ใช้ทดลอง'
  const childName = profileStore.profile?.child_name
  if (childName) return `พ่อแม่น้อง${childName}`
  const firstName = profileStore.profile?.first_name
  if (firstName) return firstName
  const email = auth.user?.email || ''
  return email.split('@')[0] || 'พ่อแม่น้อง'
})

const childIcon = computed(() => {
  const gender = profileStore.profile?.child_gender
  if (gender === 'male') return '👦'
  if (gender === 'female') return '👧'
  return '👶'
})

const formattedDate = computed(() => {
  const d = new Date(selectedDate.value + 'T12:00:00')
  return d.toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

async function loadLog() {
  selectedSymptom.value = null
  const data = await logs.fetchForDate(selectedDate.value)
  if (data) {
    selectedSymptom.value = data.symptom
  }
}

async function handleSave() {
  if (!selectedSymptom.value) return
  saving.value = true
  try {
    await logs.upsertLog(selectedDate.value, selectedSymptom.value)
    if (auth.isGuest) {
      success('✓ บันทึกอาการแล้ว (บันทึกในเครื่อง)')
    } else {
      success('✓ บันทึกอาการเรียบร้อย')
    }
  } catch (e) {
    showError(e.message || 'บันทึกไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!auth.isGuest) {
    profileStore.fetchProfile().catch(() => {})
  }
  await loadLog()
})
watch(selectedDate, loadLog)
</script>

<template>
  <div class="page-shell">
    <header class="page-header">
      <div class="page-header__text">
        <span class="eyebrow">บันทึกอาการ</span>
        <h1 class="t-page-heading">สวัสดี {{ greetingName }} 👋</h1>
      </div>
      <router-link v-if="!auth.isGuest" to="/profile" class="avatar" aria-label="โปรไฟล์">
        <img v-if="profileStore.profile?.avatar_url" :src="profileStore.profile.avatar_url" alt="" class="avatar-img" />
        <span v-else>{{ childIcon }}</span>
      </router-link>
      <span v-else class="avatar" aria-label="ผู้ใช้ทดลอง">{{ childIcon }}</span>
    </header>

    <GuestBanner />

    <section class="card date-card">
      <label for="log-date" class="card__label">เลือกวันที่</label>
      <div class="date-card__row">
        <span class="date-card__icon" aria-hidden="true">📆</span>
        <input
          id="log-date"
          v-model="selectedDate"
          type="date"
          :max="today"
          class="input input--on-surface input--date"
        />
      </div>
      <p class="date-card__display">{{ formattedDate }}</p>
    </section>

    <section class="symptom-section">
      <p class="card__label symptom-section__label">เลือกอาการของวันนี้</p>
      <fieldset class="symptom-grid">
        <legend class="sr-only">อาการ</legend>
        <SymptomCard
          v-for="s in SYMPTOMS"
          :key="s.code"
          :symptom="s"
          :selected="selectedSymptom === s.code"
          @select="selectedSymptom = $event"
        />
      </fieldset>
    </section>

    <button
      type="button"
      @click="handleSave"
      :disabled="!selectedSymptom || saving"
      class="btn btn--primary save-btn"
    >
      {{ saving ? 'กำลังบันทึก...' : 'บันทึกอาการ' }}
    </button>

    <p v-if="auth.isGuest" class="guest-hint">💾 ข้อมูลถูกบันทึกในเครื่องนี้เท่านั้น</p>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.date-card__row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.date-card__icon {
  font-size: 20px;
  flex-shrink: 0;
}

.date-card__row .input--date {
  flex: 1;
  min-width: 0;
}

.date-card__display {
  margin-top: var(--space-2);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.symptom-section {
  margin-top: var(--space-5);
}

.symptom-section__label {
  margin-bottom: var(--space-3);
}

.symptom-grid {
  border: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.save-btn {
  margin-top: var(--space-5);
}

.guest-hint {
  text-align: center;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: var(--space-2);
}

@media (max-width: 374px) {
  .symptom-grid {
    grid-template-columns: 1fr;
  }
}
</style>
