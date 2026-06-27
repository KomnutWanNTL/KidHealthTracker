<script setup>
import { computed } from 'vue'

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
})

const emit = defineEmits(['update:year', 'update:month'])

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

const label = computed(() => {
  return `${THAI_MONTHS[props.month - 1]} ${props.year + 543}`
})

const canGoNext = computed(() => {
  return props.year < currentYear || (props.year === currentYear && props.month < currentMonth)
})

function prev() {
  if (props.month === 1) {
    emit('update:year', props.year - 1)
    emit('update:month', 12)
  } else {
    emit('update:month', props.month - 1)
  }
}

function next() {
  if (!canGoNext.value) return
  if (props.month === 12) {
    emit('update:year', props.year + 1)
    emit('update:month', 1)
  } else {
    emit('update:month', props.month + 1)
  }
}
</script>

<template>
  <div class="month-picker">
    <button
      type="button"
      @click="prev"
      class="month-picker__nav"
      aria-label="เดือนก่อนหน้า"
    >‹</button>
    <h2 class="month-picker__label">{{ label }}</h2>
    <button
      type="button"
      @click="next"
      :disabled="!canGoNext"
      class="month-picker__nav"
      aria-label="เดือนถัดไป"
    >›</button>
  </div>
</template>

<style scoped>
.month-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-3) var(--space-4);
  box-shadow: var(--shadow-subtle);
}

.month-picker__nav {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--motion-fast) ease;
  background: transparent;
}

.month-picker__nav:hover:not(:disabled) {
  background: var(--color-border-subtle);
}

.month-picker__nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.month-picker__label {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}
</style>
