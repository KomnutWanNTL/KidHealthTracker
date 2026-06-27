<script setup>
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
</script>

<template>
  <div class="toast-stack" aria-live="polite" aria-atomic="true">
    <div
      v-for="t in toasts"
      :key="t.id"
      :class="['toast', `toast--${t.type}`]"
      role="status"
    >
      {{ t.message }}
    </div>
  </div>
</template>
