// /indexedDB/graphics.js
const DB_NAME = "graphics-cache";
const DB_VERSION = 3; // ⬅️ bump for new indices
const STORE = "graphics_v2";

// ---- helpers -------------------------------------------------

async function blobToSHA256Hex(blob) {
    const buf = await blob.arrayBuffer();
    const hash = await crypto.subtle.digest("SHA-256", buf);
    const view = new Uint8Array(hash);
    return Array.from(view)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = req.result;

            // Store
            if (!db.objectStoreNames.contains(STORE)) {
                const os = db.createObjectStore(STORE, { keyPath: "id" });
                os.createIndex("createdAt", "createdAt", { unique: false });
                os.createIndex("userId", "userId", { unique: false });
                // neu:
                os.createIndex("fingerprint", "fingerprint", { unique: false });
                os.createIndex("user_fingerprint", ["userId", "fingerprint"], { unique: true });
            } else {
                const os = e.currentTarget.transaction.objectStore(STORE);
                // defensiv: Indices nachziehen, falls aus älterem Schema kommend
                if (!os.indexNames.contains("createdAt")) os.createIndex("createdAt", "createdAt", { unique: false });
                if (!os.indexNames.contains("userId")) os.createIndex("userId", "userId", { unique: false });
                if (!os.indexNames.contains("fingerprint"))
                    os.createIndex("fingerprint", "fingerprint", { unique: false });
                if (!os.indexNames.contains("user_fingerprint")) {
                    os.createIndex("user_fingerprint", ["userId", "fingerprint"], { unique: true });
                }
            }

            // optionale Migration vom alten Store "graphics"
            if (db.objectStoreNames.contains("graphics")) {
                const old = e.currentTarget.transaction.objectStore("graphics");
                const neu = e.currentTarget.transaction.objectStore(STORE);
                old.openCursor().onsuccess = async (ev) => {
                    const cursor = ev.target.result;
                    if (!cursor) return;
                    const { id, name, blob } = cursor.value || {};
                    const fp = blob ? await blobToSHA256Hex(blob) : `${name}|${blob?.size || 0}`;
                    const rec = {
                        id: id || crypto.randomUUID(),
                        name: name || "grafik",
                        blob,
                        type: blob?.type || "application/octet-stream",
                        preview: null,
                        isPDF: (blob?.type || "").includes("pdf"),
                        createdAt: Date.now(),
                        userId: "anonymous",
                        fingerprint: fp,
                    };
                    try {
                        await neu.put(rec);
                    } catch {} // unique collisions ignorieren
                    cursor.continue();
                };
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// ---- API -----------------------------------------------------

export async function saveGraphicToDB({ id, name, fileOrBlob, preview, isPDF, userId }) {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const idx = store.index("user_fingerprint");

    const blob =
        fileOrBlob instanceof Blob
            ? fileOrBlob
            : new Blob([fileOrBlob], { type: fileOrBlob?.type || "application/octet-stream" });

    const fingerprint = await blobToSHA256Hex(blob);
    const uid = userId || "anonymous";

    // 1) Duplikat-Check (pro User)
    const checkReq = idx.get([uid, fingerprint]);
    const existing = await new Promise((res, rej) => {
        checkReq.onsuccess = () => res(checkReq.result || null);
        checkReq.onerror = () => rej(checkReq.error);
    });

    if (existing) {
        // nur nach oben sortieren + Metadaten optional aktualisieren
        existing.createdAt = Date.now();
        if (preview) existing.preview = preview;
        if (typeof isPDF === "boolean") existing.isPDF = isPDF;
        if (name) existing.name = name;
        await store.put(existing);
        await tx.done;
        return existing.id;
    }

    // 2) neuer Eintrag
    const rec = {
        id: id || crypto.randomUUID(),
        name: name || fileOrBlob?.name || "grafik",
        blob,
        type: blob.type || "application/octet-stream",
        preview: preview || null,
        isPDF: !!isPDF,
        createdAt: Date.now(),
        userId: uid,
        fingerprint,
    };
    await store.put(rec);
    await tx.done;
    return rec.id;
}

export async function getRecentGraphics({ userId = "anonymous", ttlHours = 48, limit = 24 } = {}) {
    const db = await openDB();
    const tx = db.transaction(STORE, "readonly");
    const idx = tx.objectStore(STORE).index("createdAt");
    const since = Date.now() - ttlHours * 3600 * 1000;

    const results = [];
    const seen = new Set(); // Fingerprints, um Alt-Doppel zu filtern

    return new Promise((resolve, reject) => {
        idx.openCursor(null, "prev").onsuccess = (e) => {
            const cursor = e.target.result;
            if (!cursor) return resolve(results.slice(0, limit));
            const item = cursor.value;

            if (item.userId === userId && item.createdAt >= since) {
                const key = item.fingerprint || `${item.name}|${item.blob?.size || 0}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    results.push(item);
                }
            }
            if (results.length >= limit) return resolve(results);
            cursor.continue();
        };
        tx.onerror = () => reject(tx.error);
    });
}

export async function deleteGraphicFromDB(id) {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    await tx.objectStore(STORE).delete(id);
    await tx.done;
}

export async function clearExpiredGraphics({ ttlHours = 48 } = {}) {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const idx = store.index("createdAt");
    const since = Date.now() - ttlHours * 3600 * 1000;

    return new Promise((resolve) => {
        idx.openCursor().onsuccess = (e) => {
            const cursor = e.target.result;
            if (!cursor) return resolve();
            const v = cursor.value;
            if (v.createdAt < since) store.delete(v.id);
            cursor.continue();
        };
    });
}
