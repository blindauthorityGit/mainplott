// utils/indexedDB.js
import { openDB } from "idb";

const DB_NAME = "graphic-cache";
const STORE = "files";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 h

export async function getDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
            }
        },
    });
}

export async function saveImageToDB(file) {
    const db = await getDB();
    const dup = (await db.getAll(STORE)).find((f) => f.name === file.name && f.blob.size === file.size);
    if (dup) return dup.id; // 🔄 already cached
    return db.add(STORE, { name: file.name, blob: file, savedAt: Date.now() });
}

export async function getImagesFromDB() {
    const db = await getDB();
    const all = await db.getAll(STORE);
    const now = Date.now();
    const keep = [];

    // Lösche alles, was älter als TTL ist
    await Promise.all(
        all.map(async (f) => {
            if (now - (f.savedAt ?? now) > TTL_MS) {
                await db.delete(STORE, f.id); // ⬅️ weg damit
            } else {
                keep.push(f);
            }
        })
    );
    return keep; // nur frische Einträge
}

export async function deleteImageFromDB(id) {
    const db = await getDB();
    return db.delete(STORE, id);
}
