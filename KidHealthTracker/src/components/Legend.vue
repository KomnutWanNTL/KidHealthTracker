<script setup>
import { computed } from 'vue'
import { SYMPTOMS } from '@/constants/symptoms'
import { useLogsStore } from '@/stores/logs'

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
})

const logs = useLogsStore()

const counts = computed(() => {
  const map = {}
  SYMPTOMS.forEach((s) => {
    map[s.code] = 0
  })
  Object.values(logs.monthLogs).forEach((symptom) => {
    if (map[symptom] !== undefined) map[symptom]++
  })
  return map
})

const totalWithData = computed(() => Object.values(logs.monthLogs).length)

const noDataCount = computed(() => {
  const daysInMonth = new Date(props.year, props.month, 0).getDate()
  const now = new Date()
  const todayYear = now.getFullYear()
  const todayMonth = now.getMonth() + 1
  const todayDate = now.getDate()

  let eligibleDays
  if (props.year > todayYear || (props.year === todayYear && props.month > todayMonth)) {
    eligibleDays = 0
  } else if (props.year === todayYear && props.month === todayMonth) {
    eligibleDays = todayDate
  } else {
    eligibleDays = daysInMonth
  }

  return Math.max(0, eligibleDays - totalWithData.value)
})
</script>

<template>
  <div class="legend">
    <div v-for="s in SYMPTOMS" :key="s.code" class="legend__row">
      <span class="legend__swatch" :style="{ backgroundColor: s.color }" aria-hidden="true"></span>
      <span class="legend__label">{{ s.label }}</span>
      <span class="legend__count">{{ counts[s.code] }} วัน</span>
    </div>

    <div class="legend__divider"></div>

    <div class="legend__row">
      <span class="legend__swatch legend__swatch--no-data" aria-hidden="true"></span>
      <span class="legend__label">ไม่มีข้อมูล</span>
      <span class="legend__count">{{ noDataCount }} วัน</span>
    </div>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: var(--space-4);
}

.legend__row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.legend__swatch {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 5px;
  flex-shrink: 0;
  box-shadow: var(--shadow-subtle);
}

.legend__swatch--no-data {
  background: var(--symptom-no-data);
  border: 1px solid var(--color-border);
}

.legend__label {
  flex: 1;
  min-width: 0;
}

.legend__count {
  color: var(--color-text-muted);
  font-weight: 700;
}

.legend__divider {
  height: 1px;
  background: var(--color-border-subtle);
  margin: 4px 0;
}
</style>
