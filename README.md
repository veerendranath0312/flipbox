# Flipbox Builder

A builder for a single interactive flipbox: edit rich-text front and back
content, and see it rendered live as a learner would experience it, with a
flip that is reachable and understandable without relying on the animation.

Built on the provided Vue 3 + Vite + TipTap 3 starter.

## Requirements

- Node.js 20.19.x, or Node.js 22.12 or later
- npm

## Install and run

```bash
npm install
npm run dev
```

Vite prints a local URL (default <http://localhost:5173>). Open it and the
builder and preview appear side by side.

Other scripts:

```bash
npm run build    # production build
npm run preview  # serve the production build locally
```

Use `npm ci` instead of `npm install` for a reproducible install from the
lockfile.

## How it works

Everything is driven by one piece of state. `App.vue` owns a single
reactive `flipbox` object and passes it to both panels — the builder edits
it, the preview reads it. Because both read the same object, the preview
updates as you type with no save, refresh or second window involved.

```tree
src/
  App.vue                        # layout, owns the flipbox state, save status
  main.js
  style.css                      # base styles, shared button states
  components/
    FlipboxBuilder.vue           # front/back fields, two-way bound to App
    FlipboxPreview.vue           # flip interaction and side indication
    RichTextEditor.vue           # TipTap editor + formatting toolbar
  composables/
    usePersistence.js            # flipbox data model, autosave, localStorage
```

### Editing

`RichTextEditor.vue` wraps TipTap and exposes paragraph, bold, italic,
bulleted list, undo and redo. The extension set is restricted to exactly
those, so no markdown shortcut can produce content the toolbar doesn't
offer and the preview doesn't style.

### Preview

Both faces stay in the DOM so the flip can animate between them, but the
inactive one is `inert` and `aria-hidden`, so only the visible side is
reachable or readable. The current side is stated three ways: a visible
status line, a live-region announcement, and the button's own label.
The animation is suppressed under `prefers-reduced-motion`.

### Persistence

`useFlipboxStorage()` returns a ref that is already restored from
`localStorage` and saves itself, debounced at 500ms, flushing immediately
when the tab is hidden or unloaded. Stored data is version-checked and
validated on read, falling back to an empty flipbox rather than rendering
a shape the code doesn't understand.

## Accessibility notes

- The formatting toolbar is a single tab stop with arrow-key navigation,
  as `role="toolbar"` requires.
- Toggle controls use `aria-pressed`; unavailable actions (undo/redo at the
  ends of history) use `aria-disabled` so they stay reachable by keyboard.
- The editor body has a visible focus ring.
- Each toolbar is named for its field ("Front text formatting"), so the two
  editors are distinguishable when listing controls.

One known gap: the "Saved at" indicator is deliberately not a live region,
because autosave fires on every typing pause and announcing it would
interrupt constantly. It is readable on demand but not announced.
