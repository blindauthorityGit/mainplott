import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    setDoc,
    addDoc,
    query,
    where,
    deleteDoc,
    updateDoc,
} from "firebase/firestore/lite";
import { getStorage, ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const firebaseConfig = {
    apiKey: process.env.NEXT_FIREBASE,
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

export { app, db, storage };

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
        console.log("File uploaded successfully:", downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

export const uploadFileToTempFolder = async (file, userId) => {
    const uniqueId = uuidv4();
    const filePath = `temp/${userId}/${uniqueId}-${file.name}`;

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

// Function to upload generated preview image to Firebase Storage
export const uploadPreviewToStorage = async (previewFileBuffer, fileName) => {
    try {
        const uniqueId = uuidv4();
        const filePath = `pdfpreviews/${uniqueId}-${fileName}`;

        // Firebase storage reference
        const storageRef = ref(storage, filePath);

        // Upload the preview image buffer
        await uploadBytes(storageRef, previewFileBuffer, {
            contentType: "image/png",
        });

        // Get download URL of the uploaded file
        const downloadURL = await getDownloadURL(storageRef);
        console.log("Preview image uploaded successfully:", downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading preview image:", error);
        throw error;
    }
};
