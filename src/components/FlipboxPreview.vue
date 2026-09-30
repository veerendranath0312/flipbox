<template>
  <div class="flipbox-preview">
    <!--
      Placed before the card so that reading the page top to bottom gives
      you the current side, then the content, then the control that changes
      it. aria-live announces the change for anyone who cannot see the flip.
    -->
    <p class="flipbox-status" aria-live="polite">
      Showing: <strong>{{ showingBack ? "Back" : "Front" }}</strong> ({{
        showingBack ? 2 : 1
      }}
      of 2)
    </p>

    <div class="flipbox-viewport">
      <!--
        Both faces stay in the DOM because the 3D flip animates between
        them. backface-visibility hides the far side visually, but a
        visually hidden face is still readable and still tabbable - so the
        inactive face also gets inert (removes it from tab order and from
        interaction) and aria-hidden (removes it from the accessibility
        tree). Without those, a screen reader would read both sides at once.

        `|| undefined` is belt-and-braces. Vue does the right thing with a
        plain boolean here, because `inert` is a real IDL property so it is
        set as a DOM property rather than an attribute. But inert is
        presence-based: on any path where it is written as an attribute
        instead, inert="false" would still be inert. undefined removes it
        outright, so the intent holds either way.
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

    <!--
      The label says what will happen, the status line above says where you
      are. Deliberately no aria-pressed: combining a changing label with a
      pressed state announces as "Show front, pressed", which reads as a
      contradiction. One state channel, not two competing ones.
    -->
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

// Which side is showing is transient view state, not part of the saved
// flipbox - a refresh should start on the front, not restore you mid-flip.
const side = ref("front")
const showingBack = computed(() => side.value === "back")

function flip() {
  side.value = showingBack.value ? "front" : "back"
}

// An "empty" editor still emits markup - TipTap normalises no content to
// <p></p>, so a plain falsy check would show a blank card instead of a
// placeholder. Parsing and checking the text is more robust than matching
// known-empty strings, and it also catches <p><br></p> and empty list
// items. Safe against the content being HTML: parseFromString does not
// execute scripts, and this editor's schema cannot produce any.
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

/* Perspective lives on the parent so the card itself can be the element
   that rotates. */
.flipbox-viewport {
  perspective: 1000px;
  width: 280px;
  max-width: 100%;
}

/* Grid rather than absolute positioning for the two faces: both occupy the
   same single grid cell, so they stack for the flip AND the card still
   sizes itself to whichever face is taller. With an absolutely positioned
   back face, a long back side would overflow a front-sized card. */
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

/* The flip is decoration; the status line and button label already carry
   the state, so removing the motion loses nothing. */
@media (prefers-reduced-motion: reduce) {
  .flipbox {
    transition: none;
  }
}
</style>
