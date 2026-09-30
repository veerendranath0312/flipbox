<template>
  <div class="app-shell">
    <header class="app-header">
      <h1>Flipbox Builder</h1>
    </header>
    <!--
      Starter layout: builder and preview shown side by side, both driven
      by the same reactive `flipbox` state, so the preview updates live
      as you edit - no manual save/refresh needed.

      You are free to restructure this (e.g. a toggle between builder and
      preview "modes" on the same page) as long as the preview still
      updates live and does not require a separate browser tab or window.
      See the task spec's "Layout" note under Flipbox component.
    -->
    <main class="app-main">
      <section class="panel" aria-labelledby="builder-heading">
        <div class="panel-header">
          <h2 id="builder-heading">Builder</h2>
          <!--
            Deliberately not a live region. Autosave fires on every typing
            pause, so announcing it would interrupt with "Saved at 14:32"
            every second or so while you work. Sighted users get passive
            confirmation; a screen reader user can read it on demand.
          -->
          <p class="save-status">
            <time v-if="lastSavedAt" :datetime="lastSavedAt">{{ savedLabel }}</time>
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
import { computed } from 'vue';
import FlipboxBuilder from './components/FlipboxBuilder.vue';
import FlipboxPreview from './components/FlipboxPreview.vue';
import { useFlipboxStorage } from './composables/usePersistence.js';

// The single source of truth for the whole app. Both the builder and the
// preview read this same reactive object, which is what makes the preview
// update live - there is no syncing step between them.
//
// The composable hands it back already restored from storage and keeps it
// saved, so nothing else in the app has to know persistence exists.
const { flipbox, lastSavedAt } = useFlipboxStorage();

const savedLabel = computed(() => {
  if (!lastSavedAt.value) return 'Not saved yet';
  const time = new Date(lastSavedAt.value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `Saved at ${time}`;
});
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
