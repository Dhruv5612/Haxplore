import { openDB } from 'idb';

const DB_NAME = 'fieldtracker';
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        // Store for pending actions when offline
        if (!db.objectStoreNames.contains('pendingActions')) {
            db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
        }
        // Store for cached data
        if (!db.objectStoreNames.contains('cache')) {
            db.createObjectStore('cache', { keyPath: 'key' });
        }
    }
});

// Save pending action when offline
export const savePendingAction = async (action) => {
    const db = await dbPromise;
    await db.add('pendingActions', {
        ...action,
        timestamp: Date.now()
    });
};

// Get all pending actions
export const getPendingActions = async () => {
    const db = await dbPromise;
    return db.getAll('pendingActions');
};

// Delete pending action after sync
export const deletePendingAction = async (id) => {
    const db = await dbPromise;
    await db.delete('pendingActions', id);
};

// Cache data
export const cacheData = async (key, data) => {
    const db = await dbPromise;
    await db.put('cache', { key, data, timestamp: Date.now() });
};

// Get cached data
export const getCachedData = async (key) => {
    const db = await dbPromise;
    const result = await db.get('cache', key);
    return result?.data;
};

// Check if online
export const isOnline = () => navigator.onLine;

// Sync pending actions when back online
export const syncPendingActions = async (api) => {
    if (!isOnline()) return;

    const pending = await getPendingActions();
    for (const action of pending) {
        try {
            await api[action.method](action.url, action.data);
            await deletePendingAction(action.id);
        } catch (error) {
            console.error('Sync failed for action:', action, error);
        }
    }
};
