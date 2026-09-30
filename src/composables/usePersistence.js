// A small, generic localStorage helper, plus the flipbox data model and the
// composable that keeps it saved.
//
// The generic save/load/clear functions at the bottom are the starter's
// original low-level plumbing. Everything above them is flipbox-specific,
// so the storage key, the schema version, the validation rules and the
// save timing all live in one file rather than being spread across
// components.

import { onScopeDispose, ref, watch } from 'vue';

// --- Flipbox data model ---------------------------------------------------

export const STORAGE_KEY = 'flipbox-builder:flipbox';

// Bumped whenever the persisted shape changes in a way older data can't
// satisfy. A stored blob outlives the code that wrote it, so on load we
// check this and fall back to defaults rather than half-loading a shape
// the current code doesn't understand.
export const SCHEMA_VERSION = 1;

// A factory, not a shared constant: every caller needs its own object, or
// they'd all mutate the same one.
//
// Note there is no `updatedAt` here, although the stored document has one.
// When it lived on the reactive object, saving had to write it back, which
// re-triggered the watcher that caused the save - a feedback loop held
// together only by the debounce. Treating it as persistence metadata
// instead of content removes that loop by construction; it is exposed as a
// separate `lastSavedAt` ref by useFlipboxStorage below.
export function createDefaultFlipbox() {
  return {
    version: SCHEMA_VERSION,
    front: '',
    back: '',
  };
}

// Guards against anything that isn't a flipbox we can render: a different
// schema version, hand-edited localStorage, or a truncated write.
export function isValidFlipbox(value) {
  return (
    !!value &&
    typeof value === 'object' &&
    value.version === SCHEMA_VERSION &&
    typeof value.front === 'string' &&
    typeof value.back === 'string'
  );
}

// --- Saved flipbox state --------------------------------------------------

// Long enough that a normal typing burst produces one write instead of one
// per keystroke, short enough that the unsaved window stays small. The
// write itself is cheap; the point is that localStorage is synchronous and
// sits on the same thread as typing, and that a "Saved" timestamp ticking
// on every character is noise rather than feedback.
const SAVE_DEBOUNCE_MS = 500;

// Reads and validates the stored document, returning both the editable
// content and when it was last written.
function readStored() {
  const stored = loadFromStorage(STORAGE_KEY);

  if (!isValidFlipbox(stored)) {
    // Covers first visit, a bumped schema version, and hand-edited or
    // truncated data. Falling back beats rendering a half-understood shape.
    return { flipbox: createDefaultFlipbox(), updatedAt: null };
  }

  return {
    // Copy known fields explicitly rather than spreading `stored`, so a
    // blob carrying extra keys can't smuggle them into app state.
    flipbox: {
      version: SCHEMA_VERSION,
      front: stored.front,
      back: stored.back,
    },
    updatedAt: typeof stored.updatedAt === 'string' ? stored.updatedAt : null,
  };
}

/**
 * Owns the flipbox: hands back a ref that is already populated from
 * storage and saves itself, plus a ref holding the last save time.
 *
 * Loading happens synchronously here rather than in onMounted, so the
 * editors are constructed with their real content instead of rendering
 * empty for a frame and then being reset.
 */
export function useFlipboxStorage() {
  const restored = readStored();
  const flipbox = ref(restored.flipbox);
  const lastSavedAt = ref(restored.updatedAt);

  let timer = null;
  let hasUnsavedChanges = false;

  function saveNow() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }

    const updatedAt = new Date().toISOString();
    const saved = saveToStorage(STORAGE_KEY, { ...flipbox.value, updatedAt });

    if (saved) {
      hasUnsavedChanges = false;
      lastSavedAt.value = updatedAt;
    }
    // On failure (private-mode quota, storage disabled) the helper has
    // already logged it and hasUnsavedChanges stays true, so the next edit
    // or flush retries. The UI keeps showing the last time that did work.
  }

  function scheduleSave() {
    hasUnsavedChanges = true;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(saveNow, SAVE_DEBOUNCE_MS);
  }

  // Only writes if there is something pending, so leaving the tab alone
  // doesn't churn the timestamp.
  function flush() {
    if (hasUnsavedChanges) saveNow();
  }

  // FlipboxBuilder replaces the whole object on every edit, so a shallow
  // watch would be enough; deep is here so that mutating a field in place
  // later still saves.
  watch(flipbox, scheduleSave, { deep: true });

  // The debounce leaves a window where the newest keystrokes exist only in
  // memory. These close it on the ways a tab actually goes away.
  //
  // `pagehide` rather than `beforeunload`: beforeunload is unreliable on
  // mobile and can disqualify the page from the back/forward cache, while
  // visibilitychange + pagehide covers tab switches, app backgrounding and
  // real navigation.
  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') flush();
  }

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', flush);

  onScopeDispose(() => {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', flush);
    flush(); // don't drop a pending edit on teardown
  });

  return { flipbox, lastSavedAt };
}

// --- Generic localStorage plumbing ----------------------------------------

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`Failed to save "${key}" to localStorage`, err);
    return false;
  }
}

export function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Failed to load "${key}" from localStorage`, err);
    return fallback;
  }
}

export function clearStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`Failed to clear "${key}" from localStorage`, err);
    return false;
  }
}
