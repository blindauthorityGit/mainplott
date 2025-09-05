import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    setDoc,
    addDoc,
    query,
    where,
    deleteDoc,
    updateDoc,
    serverTimestamp,
    orderBy,
    limit,
} from "firebase/firestore/lite";
import { getStorage, ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import {
    getAuth,
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendPasswordResetEmail,
    updatePassword,
} from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE,
    authDomain: "database-test-4bcff.firebaseapp.com",
    databaseURL: "https://database-test-4bcff.firebaseio.com",
    projectId: "database-test-4bcff",
    storageBucket: "database-test-4bcff.appspot.com",
    messagingSenderId: "473532430470",
    appId: "1:473532430470:web:bf0261ce96ec26f7b07907",
    measurementId: "G-JHGKJGQPJF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const firestore = getFirestore(app);

// --- Helpers & Konstanten ---
const isDevMode = () => String(process.env.NEXT_PUBLIC_DEV) === "true";

export { app, db, storage, auth, firestore };
// export const auth = getAuth(app);

export const fetchFirestoreData = async (collectionName) => {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        //
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};

export const uploadFileToStorage = async (file, path) => {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

export const uploadFileToTempFolder = async (file, userId) => {
    const uniqueId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = `temp/${timestamp}/${userId}/${uniqueId}-${file.name}`;

    // Firebase storage reference
    const storageRef = ref(storage, filePath);

    // Upload the file
    await uploadBytes(storageRef, file);
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Save metadata in Firestore
    const fileMetadata = {
        userId,
        fileId: uniqueId,
        filePath,
        downloadURL, // Include the download URL

        uploadTime: new Date().toISOString(),
        status: "temporary",
    };

    await setDoc(doc(db, "uploadedGraphics", uniqueId), fileMetadata);

    // Optionally store in localStorage for session restoration
    localStorage.setItem("uploadedGraphic", JSON.stringify(fileMetadata));

    return fileMetadata;
};

export const uploadLayoutFile = async (file, userId) => {
    const uniqueId = uuidv4();
    // Save files under the layoutFiles folder
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = `layoutFiles/${timestamp}/${userId}/${uniqueId}-${file.name}`;

    // Create a Firebase storage reference
    const storageRef = ref(storage, filePath);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Prepare file metadata
    const fileMetadata = {
        userId,
        fileId: uniqueId,
        filePath,
        downloadURL, // Include the download URL
        uploadTime: new Date().toISOString(),
        status: "temporary",
    };

    // Save metadata in Firestore under "layoutFiles" collection
    await setDoc(doc(db, "layoutFiles", uniqueId), fileMetadata);

    // Optionally store in localStorage for session restoration
    localStorage.setItem("uploadedLayoutGraphic", JSON.stringify(fileMetadata));

    return fileMetadata;
};

// Function to upload generated preview image to Firebase Storage
export const uploadPreviewToStorage = async (previewFileBuffer, fileName) => {
    try {
        const uniqueId = uuidv4();
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filePath = `pdfpreviews/${timestamp}/${uniqueId}-${fileName}`;

        // Firebase storage reference
        const storageRef = ref(storage, filePath);

        // Upload the preview image buffer
        await uploadBytes(storageRef, previewFileBuffer, {
            contentType: "image/png",
        });

        // Get download URL of the uploaded file
        const downloadURL = await getDownloadURL(storageRef);

        // Metadata to be stored in Firestore
        const fileMetadata = {
            fileId: uniqueId,
            filePath,
            downloadURL, // Include the download URL
            uploadTime: new Date().toISOString(),
            status: "temporary",
        };

        // Save metadata in Firestore
        await setDoc(doc(db, "uploadedGraphics", uniqueId), fileMetadata);

        // Optionally store in localStorage for session restoration
        // localStorage.setItem("uploadedGraphic", JSON.stringify(fileMetadata));

        return downloadURL;
    } catch (error) {
        console.error("Error uploading preview image:", error);
        throw error;
    }
};

// export const uploadImageToStorage = async (blob, fileName) => {
//     const filePath = `configuredImages/${fileName}`;
//     const storageRef = ref(storage, filePath);

//     await uploadBytes(storageRef, blob);
//     return await getDownloadURL(storageRef);
// };

export const uploadImageToStorage = async (blob, fileName) => {
    const isDev = process.env.NEXT_PUBLIC_DEV === "true";
    console.log(isDev);

    // Heutiges Datum im Format YYYY-MM-DD
    const currentDate = new Date().toISOString().split("T")[0];

    // Pfad mit Tagesordner und dev/production Unterordner
    const basePath = isDev ? "dev_configuredImages" : "configuredImages";
    const filePath = `${basePath}/${currentDate}/${fileName}`;

    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
};

export const uploadPurchaseToFirestore = async (purchaseData) => {
    try {
        const { customerName, ...rest } = purchaseData;

        // Reference to the 'testPurchase' collection
        const collectionRef = collection(db, "testPurchase");

        // Create a document under 'testPurchase' with customerName as the document ID
        const customerDocRef = doc(collectionRef, customerName);

        // Add purchase data to the customer's document
        await setDoc(customerDocRef, { ...rest, createdAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
        console.error("Error uploading purchase data:", error);
        throw error; // Re-throw the error to handle it in the caller
    }
};

// Save user data to Firestore
export const saveUserDataToFirestore = async (uid, userData, collectionName) => {
    try {
        const userDoc = doc(db, collectionName, uid);
        await setDoc(userDoc, {
            ...userData,
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error saving user data to Firestore:", error);
        throw error;
    }
};

export const getUserData = async (uid, isDev = false) => {
    const collections = isDev ? ["dev_firmenUsers", "dev_privatUsers"] : ["firmenUsers", "privatUsers"];

    for (const collection of collections) {
        const userDocRef = doc(firestore, collection, uid); // Pass the Firestore instance explicitly
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            userData.collection = collection;
            return userData;
        }
    }

    return null;
};

function deepSanitize(value) {
    if (value === undefined) return null;
    if (value === null) return null;

    // Dateien abfangen (nur im Browser vorhanden)
    const isFile = typeof File !== "undefined" && value instanceof File;
    const isBlob = typeof Blob !== "undefined" && value instanceof Blob;
    if (isFile || isBlob) {
        return {
            _type: isFile ? "file" : "blob",
            name: value.name || null,
            size: value.size || null,
            type: value.type || null,
        };
    }

    if (Array.isArray(value)) return value.map(deepSanitize);

    if (typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = deepSanitize(v);
        }
        return out;
    }
    return value; // string/number/bool
}

export async function createPendingOrder({ items, uploads, address, note, extra, context }) {
    const uid = context?.uid || auth.currentUser?.uid || null;
    const anonId = uid ? null : context?.anonId || null;
    if (!uid && !anonId) throw new Error("no uid/anonId");

    const basePath = uid ? `users/${uid}` : `anonUsers/${anonId}`;

    const payload = deepSanitize({
        createdAt: serverTimestamp(),
        status: "pending",
        items,
        uploads,
        address: address || null,
        note: note || null,
        extra: extra || null,
        scope: uid ? "auth" : "anon",
        uid: uid || null,
        anonId: anonId || null,
    });

    // Debug (kannst du nach Testen wieder rausnehmen)
    // console.log("pending payload", payload);

    const ref = await addDoc(collection(db, `${basePath}/pendingOrders`), payload);
    return { pendingId: ref.id, scope: payload.scope, ownerId: uid || anonId };
}

const COLL = {
    company: () => (isDevMode() ? "dev_firmenUsers" : "firmenUsers"),
    private: () => (isDevMode() ? "dev_privatUsers" : "privatUsers"),
};

// Sucht ein einzelnes Doc in einer Collection per UID
async function _getDocByUid(collName, uid) {
    const snap = await getDoc(doc(db, collName, uid));
    return snap.exists() ? { id: snap.id, ...snap.data(), _collection: collName } : null;
}

// Sucht per Email (lowercased) in einer Collection
async function _getDocByEmail(collName, email) {
    const q = query(collection(db, collName), where("email", "==", String(email).toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data(), _collection: collName };
}

/**
 * Profil holen (Firmen/Privat), erst Firmen dann Privat.
 * Du kannst per uid ODER email suchen (email bevorzugt, wenn beides gegeben).
 */
export async function fetchUserProfile({ uid = null, email = null } = {}) {
    if (!uid && !email) throw new Error("fetchUserProfile: uid ODER email erforderlich.");

    // Firmenkunde zuerst
    if (email) {
        const byEmailCompany = await _getDocByEmail(COLL.company(), email);
        if (byEmailCompany) return byEmailCompany;
        const byEmailPrivate = await _getDocByEmail(COLL.private(), email);
        if (byEmailPrivate) return byEmailPrivate;
    }

    if (uid) {
        const byUidCompany = await _getDocByUid(COLL.company(), uid);
        if (byUidCompany) return byUidCompany;
        const byUidPrivate = await _getDocByUid(COLL.private(), uid);
        if (byUidPrivate) return byUidPrivate;
    }

    return null;
}

/**
 * Pending Orders aus users/{uid}/pendingOrders holen.
 * Standard: neueste zuerst, max N.
 */
export async function fetchPendingOrders(uid, maxItems = 50) {
    if (!uid) throw new Error("fetchPendingOrders: uid fehlt.");
    const sub = collection(db, `users/${uid}/pendingOrders`);
    const qy = query(sub, orderBy("createdAt", "desc"), limit(maxItems));
    const snap = await getDocs(qy);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Komfort‑Fetcher für’s Dashboard:
 *  - Sucht Profil (per email→uid oder direkt uid)
 *  - Holt danach pendingOrders
 *  - Gibt beides zusammen zurück
 */
export async function fetchDashboardData({ email = null, uid = null, maxPending = 50 } = {}) {
    // 1) Profil holen
    const profile = await fetchUserProfile({ uid, email });

    // 2) UID bestimmen (wenn wir via Email gesucht haben)
    const resolvedUid = uid || profile?.id || null;

    // 3) Pending holen (nur wenn wir eine UID sicher haben)
    const pending = resolvedUid ? await fetchPendingOrders(resolvedUid, maxPending) : [];

    return { profile, pending, uid: resolvedUid };
}

// pending order löschen (auth- oder anon-Scope)
export async function deletePendingOrder({ uid, pendingId }) {
    if (!uid || !pendingId) throw new Error("uid oder pendingId fehlt");
    const ref = doc(db, "users", uid, "pendingOrders", pendingId); // << segmentiert
    await deleteDoc(ref);
    return true;
}

// ---- Utils
const hash = (s) => {
    let h = 0,
        i,
        chr;
    if (!s) return "0";
    for (i = 0; i < s.length; i++) {
        chr = s.charCodeAt(i);
        h = (h << 5) - h + chr;
        h |= 0;
    }
    return String(h);
};

// Baut eine flache Liste an Assets aus pendingOrders
export async function fetchUserAssetsFromPending(uid, take = 100) {
    const orders = await fetchPendingOrders(uid, take); // hast du schon
    const imagesMap = new Map(); // url -> asset
    const texts = [];

    orders.forEach((entry) => {
        const orderId = entry.id;
        (entry.items || []).forEach((it) => {
            const snap = it?.snapshot || {};
            const productTitle = snap?.productTitle || "Artikel";
            const canvas = snap?.canvas || null; // falls du das speicherst

            const frontImgs = (snap?.sides?.front?.images || []).map((x) => ({ ...x, side: "front" }));
            const backImgs = (snap?.sides?.back?.images || []).map((x) => ({ ...x, side: "back" }));

            // Upload-Images
            [...frontImgs, ...backImgs]
                .filter((i) => i?.type === "upload" && i?.url)
                .forEach((img) => {
                    const id = "img_" + hash(img.url);
                    if (!imagesMap.has(img.url)) {
                        imagesMap.set(img.url, {
                            id,
                            kind: "image",
                            url: img.url,
                            side: img.side || null,
                            placement: {
                                x: img.x ?? 300,
                                y: img.y ?? 200,
                                scale: img.scale ?? 1,
                                rotation: img.rotation ?? 0,
                            },
                            productTitle,
                            orderId,
                            canvas: canvas || null,
                            lastUsedAt: entry.createdAt?.toDate ? entry.createdAt.toDate() : null,
                        });
                    }
                });

            // Textlayer
            const frontTxts = snap?.sides?.front?.texts || [];
            const backTxts = snap?.sides?.back?.texts || [];
            [
                ...frontTxts.map((t) => ({ ...t, side: "front" })),
                ...backTxts.map((t) => ({ ...t, side: "back" })),
            ].forEach((t) => {
                const id = "txt_" + hash([t.value, t.fontFamily, t.fontSize, t.fill].join("|"));
                texts.push({
                    id,
                    kind: "text",
                    side: t.side,
                    value: t.value,
                    fontFamily: t.fontFamily,
                    fontSize: t.fontSize,
                    fill: t.fill,
                    letterSpacing: t.letterSpacing ?? null,
                    lineHeight: t.lineHeight ?? null,
                    placement: { x: t.x || 300, y: t.y || 200, scale: t.scale || 1, rotation: t.rotation || 0 },
                    productTitle,
                    orderId,
                    canvas: canvas || null,
                    lastUsedAt: entry.createdAt?.toDate ? entry.createdAt.toDate() : null,
                });
            });
        });
    });

    const images = Array.from(imagesMap.values());
    // optional sort
    images.sort((a, b) => (b.lastUsedAt?.getTime?.() || 0) - (a.lastUsedAt?.getTime?.() || 0));
    texts.sort((a, b) => (b.lastUsedAt?.getTime?.() || 0) - (a.lastUsedAt?.getTime?.() || 0));
    return { images, texts };
}

// Speichert/aktualisiert ein Asset in users/{uid}/library/{assetId}
export async function upsertLibraryAsset(uid, asset) {
    const ref = doc(db, "users", uid, "library", asset.id);
    await setDoc(ref, { ...asset, lastUsedAt: new Date() }, { merge: true });
}

// Liest Library
export async function fetchLibrary(uid, take = 200) {
    const sub = collection(db, "users", uid, "library");
    const qy = query(sub, orderBy("lastUsedAt", "desc"), limit(take));
    const snap = await getDocs(qy);
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const images = rows.filter((r) => r.kind === "image");
    const texts = rows.filter((r) => r.kind === "text");
    return { images, texts };
}

export async function updateFirestoreProfile({ collection, docId, data }) {
    if (!collection || !docId) throw new Error("collection/docId fehlt");
    const ref = doc(db, collection, docId);
    await setDoc(ref, data, { merge: true });
}

/** Reset‑E‑Mail für aktuelles oder gegebenes E‑Mail */
export async function sendPasswordResetForEmail(email) {
    if (!email) throw new Error("email fehlt");
    return sendPasswordResetEmail(auth, email);
}

/** Direktes Passwort ändern mit Re‑Auth */
export async function changePasswordWithReauth(oldPassword, newPassword) {
    const user = auth.currentUser;
    if (!user?.email) throw new Error("Kein eingeloggter Nutzer");
    const cred = EmailAuthProvider.credential(user.email, oldPassword);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPassword);
}
