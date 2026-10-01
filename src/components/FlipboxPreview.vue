<template>
  <div class="flipbox-preview">
    <p class="flipbox-status" aria-live="polite">
      Showing: <strong>{{ showingBack ? "Back" : "Front" }}</strong> ({{
        showingBack ? 2 : 1
      }}
      of 2)
    </p>

    <div class="flipbox-viewport">
      <!--
        Both faces stay in the DOM for the flip. backface-visibility only
        hides the far one visually - it stays readable and tabbable - so the
        inactive face is also inert and aria-hidden.
      -->
      <div class="flipbox" :class="{ 'is-flipped': showingBack }">
        <div
          class="flipbox-face flipbox-face--front"
          :inert="showingBack || undefined"
          :aria-hidden="showingBack"
        >
          <p v-if="frontIsEmpty" class="flipbox-empty">Front is empty.</p>
          <div v-else class="flipbox-content" v-html="flipbox.front"></div>
        </div>

        <div
          class="flipbox-face flipbox-face--back"
          :inert="!showingBack || undefined"
          :aria-hidden="!showingBack"
        >
          <p v-if="backIsEmpty" class="flipbox-empty">Back is empty.</p>
          <div v-else class="flipbox-content" v-html="flipbox.back"></div>
        </div>
      </div>
    </div>

    <!-- No aria-pressed: with a changing label it announces as "Show
         front, pressed", which reads as a contradiction. -->
    <button type="button" class="flipbox-flip" @click="flip">
      {{ showingBack ? "Show front" : "Show back" }}
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"

const props = defineProps({
  flipbox: {
    type: Object,
    required: true,
  },
})

// View state, not saved: a refresh should start on the front.
const side = ref("front")
const showingBack = computed(() => side.value === "back")

function flip() {
  side.value = showingBack.value ? "front" : "back"
}

// TipTap normalises an empty editor to <p></p>, so a falsy check isn't
// enough. Checking the text also catches <p><br></p> and empty list items.
function isEmptyHtml(html) {
  if (!html) return true
  const parsed = new DOMParser().parseFromString(html, "text/html")
  return parsed.body.textContent.trim() === ""
}

const frontIsEmpty = computed(() => isEmptyHtml(props.flipbox.front))
const backIsEmpty = computed(() => isEmptyHtml(props.flipbox.back))
</script>

<style scoped>
.flipbox-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.flipbox-status {
  margin: 0;
  font-size: 0.9rem;
  color: #57606a;
}

.flipbox-viewport {
  perspective: 1000px;
  width: 280px;
  max-width: 100%;
}

/* Both faces share one grid cell, so they stack for the flip and the card
   still sizes to the taller of the two.
   Note: overflow, filter or opacity on this element would flatten the 3D
   context and silently break the flip. */
.flipbox {
  display: grid;
  min-height: 180px;
  transform-style: preserve-3d;
  transition: transform 450ms ease;
}

.flipbox.is-flipped {
  transform: rotateY(180deg);
}

.flipbox-face {
  grid-area: 1 / 1;
  backface-visibility: hidden;
  min-width: 0;
  overflow-wrap: anywhere;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 16px;
  background: #ffffff;
}

.flipbox-face--back {
  transform: rotateY(180deg);
}

.flipbox-empty {
  margin: 0;
  color: #8c959f;
  font-style: italic;
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

@media (prefers-reduced-motion: reduce) {
  .flipbox {
    transition: none;
  }
}
</style>
