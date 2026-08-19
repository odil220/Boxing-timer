// Constants
export const STORAGE_KEY = 'boxing-timer-music';
export const DB_NAME = 'boxing-timer-music-db';
export const DB_VERSION = 1;
export const STORE_NAME = 'songs';

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function loadSavedSongs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const metadataList = JSON.parse(saved);
    if (!Array.isArray(metadataList)) return [];

    let db;
    try { db = await openDB(); } catch { return metadataList; }

    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const results = [];
      tx.oncomplete = () => resolve(results);
      tx.onerror = () => resolve(metadataList);
      metadataList.forEach((meta) => {
        const req = store.get(meta.id);
        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            results.push({ ...meta, url: URL.createObjectURL(req.result.blob) });
          } else {
            results.push(meta);
          }
        };
        req.onerror = () => results.push(meta);
      });
    });
  } catch (e) {
    console.error('Failed to load saved songs:', e);
    return [];
  }
}

// Save songs: metadata in localStorage, blob data in IndexedDB
export async function saveSongs(songs) {
  // Save metadata to localStorage (without blob data/URLs)
  const metadataList = songs.map(({ id, name, artist, album, duration, type, size }) =>
    ({ id, name, artist, album, duration, type, size })
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(metadataList));

  // Fetch all blob data BEFORE starting the IndexedDB transaction
  // (because await calls inside a transaction can cause it to abort)
  const blobEntries = [];
  for (const song of songs) {
    if (song.url && song.url.startsWith('blob:')) {
      try {
        const response = await fetch(song.url);
        const blob = await response.blob();
        blobEntries.push({ id: song.id, blob });
      } catch (e) {
        console.warn('Failed to read song blob for', song.id);
      }
    }
  }

  // Now do all IDB writes in a single transaction (synchronous within the tx)
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    store.clear();
    blobEntries.forEach(({ id, blob }) => store.put({ id, blob }));

    await new Promise((resolve) => {
      tx.oncomplete = resolve;
      tx.onerror = resolve;
      tx.onabort = resolve;
    });
  } catch (e) {
    console.warn('IDB save failed (songs still work during session):', e);
  }
}

export function readAudioMetadata(file) {
  return new Promise((resolve) => {
    const tempAudio = new Audio();
    tempAudio.preload = 'metadata';
    tempAudio.src = URL.createObjectURL(file);
    const cleanup = () => URL.revokeObjectURL(tempAudio.src);
    tempAudio.addEventListener('loadedmetadata', () => { cleanup(); resolve(tempAudio.duration || 0); }, { once: true });
    tempAudio.addEventListener('error', () => { cleanup(); resolve(0); }, { once: true });
  });
}
