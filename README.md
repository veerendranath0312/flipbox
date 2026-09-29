# Flipbox Builder - Starter App

This is the starter project for the Flipbox Builder developer task. It gives
you a running Vue 3 + Vite project with TipTap 3 installed and wired up, a
generic persistence helper, base styling, and empty component shells marked
with `TODO` comments where your work should go.

Refer to the full task spec for requirements, evaluation priorities, time
expectations, and submission instructions. This README only covers getting
the starter running.

## Requirements

- Node.js 20.19.x, or Node.js 22.12 or later
- npm

## Install and run

```bash
npm install
npm run dev
```

Other available scripts:

```bash
npm run build    # production build
npm run preview  # preview the production build locally
```

## Dependency baseline

Updated September 14, 2026 to TipTap 3.31.3, Vue 3.5.42, Vite 8.3.0,
and @vitejs/plugin-vue 6.0.9. The lockfile records the resolved versions.
Use `npm ci` for a reproducible install. Follow the TipTap v3 documentation;
`setContent` takes an options object, including `emitUpdate: false` when
synchronizing incoming content without emitting another update.

## Project structure

```tree
src/
  App.vue                        # top-level layout (builder + preview)
  main.js
  style.css
  components/
    FlipboxBuilder.vue           # TODO: front/back editing, persistence
    FlipboxPreview.vue           # TODO: flip interaction, state communication
    RichTextEditor.vue           # TipTap wiring; TODO: formatting toolbar
  composables/
    usePersistence.js            # generic localStorage save/load helper
```

## What's already set up for you

- A running Vue 3 + Vite project, using the Composition API (`<script setup>`).
- TipTap wired into `RichTextEditor.vue`, including one working example
  button (Bold) that shows the command pattern.
- A generic `localStorage` helper in `usePersistence.js` (save/load/clear).
- Base styling in `style.css`, including a visible focus style for buttons.
- `App.vue` renders the builder and preview side by side as a starting
  layout, both driven by the same reactive state so the preview updates
  live as you edit.

## What you need to build

Look for `TODO` comments in:

- **`RichTextEditor.vue`** - the formatting toolbar (bold, italic, one list
  style, undo, redo).
- **`FlipboxBuilder.vue`** - persistence, and anything else beyond
  front/back text you choose to add.
- **`FlipboxPreview.vue`** - the flip interaction itself, and communicating
  the current side without relying only on the visual animation.

## Restructuring the starter

You're free to restructure components, rename files, add supporting
packages, or change the layout, as long as the required behavior in the
task spec is met - including the requirement that the preview update live
as the flipbox is edited, without a manual save/refresh and without a
separate browser tab or window. Note any significant changes you make in
your project summary.
