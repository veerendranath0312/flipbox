<template>
  <div class="flipbox-preview">
    <!--
      TODO: Build the flip interaction here.
      - Show the front of the flipbox by default and let the user reveal
        the back.
      - Let the user flip back and forth between front and back.
      - Reflect the builder content and formatting accurately (this
        component already receives live updates via the `flipbox` prop).
      - Communicate the current side (front or back) in a way that does
        not rely only on the visual flip animation - think about both
        sighted users who might miss the animation and screen reader
        users.

      The markup below is only a placeholder showing the front content.
      Replace it with your flipbox structure and interaction.
    -->
    <div class="flipbox">
      <div class="flipbox-content">
        <div class="flipbox-front" v-html="flipbox.front"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  flipbox: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.flipbox-preview {
  display: flex;
  justify-content: center;
}

.flipbox {
  width: 280px;
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  min-height: 180px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 16px;
  background: #ffffff;
}

.flipbox-content :deep(p) {
  margin: 0 0 8px;
}

.flipbox-content :deep(ul),
.flipbox-content :deep(ol) {
  margin: 0 0 8px;
  padding-left: 24px;
}
.flipbox-content :deep(pre) {
  white-space: pre-wrap;
}
</style>
