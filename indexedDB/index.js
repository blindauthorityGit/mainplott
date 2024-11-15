import { openDB } from "idb";

const dbPromise = openDB("image-store", 1, {
    upgrade(db) {
        db.createObjectStore("images", { keyPath: "name" });
    },
});

export async function saveImageToDB(name, blob) {
    const db = await dbPromise;
    await db.put("images", { name, blob });
}

export async function getImageFromDB(name) {
    const db = await dbPromise;
    const data = await db.get("images", name);
    return data ? data.blob : null;
}

export async function deleteImageFromDB(name) {
    const db = await dbPromise;
    await db.delete("images", name);
}

export async function clearImageStore() {
    const db = await dbPromise;
    await db.clear("images");
}
