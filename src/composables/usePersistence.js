import { onScopeDispose, ref, watch } from "vue"

export const STORAGE_KEY = "flipbox-builder:flipbox"

const SAVE_DEBOUNCE_MS = 500

function isValidFlipbox(value) {
  return (
    !!value &&
    typeof value === "object" &&
    typeof value.front === "string" &&
    typeof value.back === "string"
  )
}

function readStored() {
  const stored = loadFromStorage(STORAGE_KEY)

  if (!isValidFlipbox(stored)) {
    return { flipbox: { front: "", back: "" }, updatedAt: null }
  }

  return {
    // Copy by name rather than spreading, so unexpected keys in storage
    // can't end up in app state.
    flipbox: {
      front: stored.front,
      back: stored.back,
    },
    updatedAt: typeof stored.updatedAt === "string" ? stored.updatedAt : null,
  }
}

// Returns a flipbox ref already restored from storage that saves itself,
// plus the time of the last successful save.
//
// `updatedAt` is kept out of the reactive object on purpose: when it lived
// there, saving wrote the timestamp back and re-triggered the watcher that
// caused the save.
export function useFlipboxStorage() {
  const restored = readStored()
  const flipbox = ref(restored.flipbox)
  const lastSavedAt = ref(restored.updatedAt)

  let timer = null
  let hasUnsavedChanges = false

  function saveNow() {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }

    const updatedAt = new Date().toISOString()
    const saved = saveToStorage(STORAGE_KEY, { ...flipbox.value, updatedAt })

    // On failure hasUnsavedChanges stays true, so the next edit retries.
    if (saved) {
      hasUnsavedChanges = false
      lastSavedAt.value = updatedAt
    }
  }

  function scheduleSave() {
    hasUnsavedChanges = true
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(saveNow, SAVE_DEBOUNCE_MS)
  }

  function flush() {
    if (hasUnsavedChanges) saveNow()
  }

  watch(flipbox, scheduleSave, { deep: true })

  // Closes the debounce window when the tab goes away. pagehide rather than
  // beforeunload, which is unreliable on mobile and blocks the bfcache.
  function onVisibilityChange() {
    if (document.visibilityState === "hidden") flush()
  }

  document.addEventListener("visibilitychange", onVisibilityChange)
  window.addEventListener("pagehide", flush)

  onScopeDispose(() => {
    document.removeEventListener("visibilitychange", onVisibilityChange)
    window.removeEventListener("pagehide", flush)
    flush()
  })

  return { flipbox, lastSavedAt }
}

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (err) {
    console.error(`Failed to save "${key}" to localStorage`, err)
    return false
  }
}

export function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (err) {
    console.error(`Failed to load "${key}" from localStorage`, err)
    return fallback
  }
}

export function clearStorage(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (err) {
    console.error(`Failed to clear "${key}" from localStorage`, err)
    return false
  }
}
