<template>
  <teleport to="body">
    <div v-if="open" class="dialog-overlay" @click.self="$emit('close')">
      <div class="dialog">
        <div class="dialog-header">
          <h3 style="margin: 0">{{ title }}</h3>
          <div class="spacer"></div>
          <button class="btn ghost sm" @click="$emit('close')">✕</button>
        </div>
        <div class="dialog-body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="dialog-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
defineProps({ open: Boolean, title: String });
defineEmits(['close']);
</script>
