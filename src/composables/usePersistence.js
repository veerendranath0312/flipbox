// A small, generic localStorage helper.
//
// This is intentionally low-level plumbing, not a finished persistence
// solution: you decide the data shape, the storage key(s), and when to
// save and load. Wire this into FlipboxBuilder.vue (or wherever makes
// sense in your structure) to satisfy the persistence requirement in the
// task spec.

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
