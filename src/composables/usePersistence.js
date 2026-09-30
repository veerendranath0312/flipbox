// A small, generic localStorage helper, plus the flipbox data model that
// sits on top of it.
//
// The generic save/load/clear functions below are the starter's original
// low-level plumbing. Everything above them defines the one shape we
// actually persist, so the storage key, the schema version and the
// validation rules all live in a single file.

// --- Flipbox data model ---------------------------------------------------

export const STORAGE_KEY = 'flipbox-builder:flipbox';

// Bumped whenever the persisted shape changes in a way older data can't
// satisfy. A stored blob outlives the code that wrote it, so on load we
// check this and fall back to defaults rather than half-loading a shape
// the current code doesn't understand.
export const SCHEMA_VERSION = 1;

// A factory, not a shared constant: every caller needs its own object, or
// they'd all mutate the same one.
export function createDefaultFlipbox() {
  return {
    version: SCHEMA_VERSION,
    front: '',
    back: '',
    updatedAt: null, // ISO string once saved; null means "never saved"
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
