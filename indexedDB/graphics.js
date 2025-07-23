// utils/indexedDB.js
import { openDB } from "idb";

const DB_NAME = "graphic-cache";
const STORE = "files";

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
    return db.getAll(STORE); // [{id, name, blob, …}, …]
}

export async function deleteImageFromDB(id) {
    const db = await getDB();
    return db.delete(STORE, id);
}
