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
} from "firebase/firestore/lite";
import { getStorage, ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "firebase/auth";

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
