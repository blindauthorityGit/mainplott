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
    console.log(file);

    // Firebase storage reference
    const storageRef = ref(storage, filePath);

    // Upload the file
    await uploadBytes(storageRef, file);
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log(downloadURL);
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
    const filePath = `layoutFiles/${userId}/${uniqueId}-${file.name}`;
    console.log("Uploading layout file:", file);

    // Create a Firebase storage reference
    const storageRef = ref(storage, filePath);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Download URL:", downloadURL);

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
    console.log(fileMetadata);
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

export const uploadImageToStorage = async (blob, fileName) => {
    const filePath = `configuredImages/${fileName}`;
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

        console.log("Purchase data uploaded successfully for customer:", customerName);
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
        console.log(`User data saved to collection: ${collectionName}`);
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
