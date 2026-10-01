<template>
  <div class="app-shell">
    <header class="app-header">
      <h1>Flipbox Builder</h1>
    </header>
    <main class="app-main">
      <section class="panel" aria-labelledby="builder-heading">
        <div class="panel-header">
          <h2 id="builder-heading">Builder</h2>
          <!-- Not a live region: autosave fires on every typing pause, so
               announcing it would interrupt constantly. -->
          <p class="save-status">
            <time v-if="lastSavedAt" :datetime="lastSavedAt">{{
              savedLabel
            }}</time>
            <span v-else>{{ savedLabel }}</span>
          </p>
        </div>
        <FlipboxBuilder v-model="flipbox" />
      </section>

      <section class="panel" aria-labelledby="preview-heading">
        <h2 id="preview-heading">Preview</h2>
        <FlipboxPreview :flipbox="flipbox" />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue"
import FlipboxBuilder from "./components/FlipboxBuilder.vue"
import FlipboxPreview from "./components/FlipboxPreview.vue"
import { useFlipboxStorage } from "./composables/usePersistence.js"

// Builder and preview share this one object, which is what keeps the
// preview live without a syncing step.
const { flipbox, lastSavedAt } = useFlipboxStorage()

const savedLabel = computed(() => {
  if (!lastSavedAt.value) return "Not saved yet"
  const time = new Date(lastSavedAt.value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
  return `Saved at ${time}`
})
</script>

<style scoped>
.app-shell {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}

.app-header {
  margin-bottom: 24px;
}

.app-header h1 {
  margin: 0;
}

.app-main {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  align-items: start;
}

.panel {
  min-width: 0;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 16px;
  background: #ffffff;
}

.panel h2 {
  margin-top: 0;
}

.panel-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px; /* replaces the h2's own bottom margin, zeroed below */
}

.panel-header h2 {
  margin-bottom: 0;
}

.save-status {
  margin: 0 0 0 auto;
  font-size: 0.85rem;
  color: #57606a;
}

@media (max-width: 720px) {
  .app-main {
    grid-template-columns: 1fr;
  }
}
</style>
