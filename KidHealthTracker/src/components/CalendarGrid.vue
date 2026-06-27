<script setup>
import { computed } from 'vue'
import { SYMPTOM_MAP } from '@/constants/symptoms'
import { useLogsStore } from '@/stores/logs'

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true },
})

const logs = useLogsStore()

const DAYS_THAI = [
  { short: 'อา', sunday: true },
  { short: 'จ' },
  { short: 'อ' },
  { short: 'พ' },
  { short: 'พฤ' },
  { short: 'ศ' },
  { short: 'ส' },
]

const todayStr = computed(() => new Date().toISOString().split('T')[0])

const firstDay = computed(() => new Date(props.year, props.month - 1, 1).getDay())

const daysInMonth = computed(() => new Date(props.year, props.month, 0).getDate())

const cells = computed(() => {
  const result = []
  const totalCells = firstDay.value + daysInMonth.value
  const weeks = Math.ceil(totalCells / 7)
  const totalSlots = weeks * 7

  for (let i = 0; i < totalSlots; i++) {
    const day = i - firstDay.value + 1
    if (day < 1 || day > daysInMonth.value) {
      result.push({ day: null, dateStr: null, symptom: null })
    } else {
      const monthPad = String(props.month).padStart(2, '0')
      const dayPad = String(day).padStart(2, '0')
      const dateStr = `${props.year}-${monthPad}-${dayPad}`
      const symptom = logs.monthLogs[dateStr] ?? null
      const isFuture = dateStr > todayStr.value
      const isToday = dateStr === todayStr.value
      result.push({ day, dateStr, symptom, isFuture, isToday })
    }
  }
  return result
})

function cellClass(cell) {
  if (!cell || !cell.day) return 'calendar__cell--empty'
  if (cell.isFuture) return 'calendar__cell--future'
  if (cell.symptom) {
    const s = SYMPTOM_MAP[cell.symptom]
    if (s) return `calendar__cell--data calendar__cell--${s.cssClass}`
    return 'calendar__cell--data'
  }
  return ''
}

function cellEmoji(cell) {
  if (!cell?.symptom) return null
  return SYMPTOM_MAP[cell.symptom]?.emoji ?? null
}
</script>

<template>
  <div class="calendar">
    <div
      v-for="(d, i) in DAYS_THAI"
      :key="`h-${i}`"
      :class="['calendar__head', { 'calendar__head--sunday': d.sunday }]"
    >
      {{ d.short }}
    </div>

    <div
      v-for="(cell, i) in cells"
      :key="`c-${i}`"
      :data-date="cell?.dateStr ?? ''"
      :class="[
        'calendar__cell',
        cellClass(cell),
        { 'calendar__cell--today': cell?.isToday && !cell?.symptom },
      ]"
    >
      <template v-if="cell?.day">
        <span>{{ cell.day }}</span>
        <span v-if="cellEmoji(cell)" class="calendar__cell-emoji" aria-hidden="true">
          {{ cellEmoji(cell) }}
        </span>
      </template>
    </div>
  </div>
</template>
