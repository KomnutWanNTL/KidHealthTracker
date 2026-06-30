<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useLogsStore } from '@/stores/logs'
import { useAuthStore } from '@/stores/auth'
import { useExportPdf } from '@/composables/useExportPdf'
import { useToast } from '@/composables/useToast'
import MonthPicker from '@/components/MonthPicker.vue'
import GuestBanner from '@/components/GuestBanner.vue'
import CalendarGrid from '@/components/CalendarGrid.vue'
import Legend from '@/components/Legend.vue'

const logs = useLogsStore()
const auth = useAuthStore()
const { exportCalendar } = useExportPdf()
const { success, error: showError } = useToast()

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const loading = ref(false)
const exporting = ref(false)

const calendarRef = ref(null)

const monthLabel = computed(() => `${THAI_MONTHS[month.value - 1]} ${year.value + 543}`)
const yearMonthStr = computed(() => `${year.value}-${String(month.value).padStart(2, '0')}`)

async function loadMonth() {
  loading.value = true
  await logs.fetchMonth(year.value, month.value)
  loading.value = false
}

async function handleExport() {
  if (!calendarRef.value) return
  exporting.value = true
  try {
    await exportCalendar(calendarRef.value, yearMonthStr.value)
    success('ส่งออก PDF เรียบร้อย')
  } catch (e) {
    showError(e.message || 'ส่งออก PDF ไม่สำเร็จ')
  } finally {
    exporting.value = false
  }
}

onMounted(loadMonth)
watch([year, month], loadMonth)
</script>

<template>
  <div class="page-shell">
    <header class="page-header">
      <div class="page-header__text">
        <span class="eyebrow">สรุปสุขภาพ</span>
        <h1 class="t-page-heading">ปฏิทินอาการ</h1>
      </div>
    </header>

    <GuestBanner />

    <MonthPicker
      :year="year"
      :month="month"
      @update:year="year = $event"
      @update:month="month = $event"
    />

    <div v-if="loading" class="summary-loading">
      <p>กำลังโหลด...</p>
    </div>

    <div v-else ref="calendarRef" class="summary-canvas card">
      <h3 class="summary-canvas__title">KidHealth Tracker — {{ monthLabel }}</h3>
      <CalendarGrid :year="year" :month="month" />
      <Legend :year="year" :month="month" />
    </div>

    <div class="summary-actions">
      <button
        type="button"
        @click="handleExport"
        :disabled="exporting || loading"
        class="btn btn--export"
      >
        <span aria-hidden="true">📄</span>
        {{ exporting ? 'กำลังส่งออก...' : 'Export PDF' }}
      </button>
      <router-link to="/dashboard" class="btn btn--secondary">
        ← กลับไปบันทึก
      </router-link>
    </div>

    <p v-if="auth.isGuest" class="guest-hint">💾 ข้อมูลจากโหมดทดลอง (บันทึกในเครื่อง)</p>
  </div>
</template>

<style scoped>
.summary-loading {
  margin-top: var(--space-5);
  text-align: center;
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 600;
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
}

.summary-canvas {
  margin-top: var(--space-4);
}

.summary-canvas__title {
  text-align: center;
  font-size: 14px;
  font-weight: 800;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.guest-hint {
  text-align: center;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: var(--space-3);
}
</style>
