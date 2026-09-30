# Flipbox Builder — take-home task

## Context

Timed take-home exercise (~4-6 focused hours) for a frontend role. My background
is React, not Vue — briefly explain Vue-specific concepts as you introduce them
(ref/computed, v-model, composables) so I can understand and explain every part
of this in a follow-up interview.

## Stack

Vue 3 (Composition API, `<script setup>)`, Vite, TipTap 3 (`@tiptap/vue-3,
@tiptap/starter-kit`), plain scoped CSS, localStorage via
src/composables/usePersistence.js.

## Ground rules

- Work from the existing starter structure and match its existing patterns
  (the prop/computed/v-model pattern already in FlipboxBuilder.vue).
- Don't introduce Pinia, Vue Router, a UI kit, or a test framework unless I
  explicitly ask — this is scoped, not a production app.
- Semantic HTML first; ARIA only where it's actually needed.
- No extra formatting, animation polish, or automated tests beyond spec
  unless I ask — the task explicitly says not to spend time on optional extras.
- After any change, tell me in plain language what changed, why, and any
  trade-off or alternative you considered, so I can decide and document it.

## Requirements

Builder: edit front/back with TipTap — paragraphs, bold, italic, one list
style, undo/redo. Persist so it survives a page refresh.

Preview: show front by default, let the user flip back and forth, reflect
builder content live (no manual save/refresh), and communicate current side
in a way that doesn't rely only on the visual flip animation.

No separate browser tab/window for the preview.
