<script setup>
defineProps({
  symptom: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})

defineEmits(['select'])
</script>

<template>
  <button
    type="button"
    role="radio"
    :aria-checked="selected"
    @click="$emit('select', symptom.code)"
    :class="[
      'symptom-card',
      `symptom-card--${symptom.cssClass}`,
      { 'symptom-card--selected': selected, 'symptom-card--full': symptom.fullWidth },
    ]"
  >
    <span class="symptom-card__emoji" aria-hidden="true">{{ symptom.emoji }}</span>
    <span class="symptom-card__label">{{ symptom.label }}</span>
    <span v-if="selected" class="symptom-card__check">✓ เลือกแล้ว</span>
  </button>
</template>
