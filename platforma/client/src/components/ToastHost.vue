<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="t.type">
        {{ t.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useUiStore } from '../stores/ui';
const ui = useUiStore();
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
