import {initializeApp} from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore/lite'
import {getStorage, ref, uploadBytes, listAll, getDownloadURL} from 'firebase/storage'
import dotenv from 'dotenv'

const firebaseConfig = {
  apiKey: process.env.NEXT_FIREBASE,
  authDomain: 'database-test-4bcff.firebaseapp.com',
  databaseURL: 'https://database-test-4bcff.firebaseio.com',
  projectId: 'database-test-4bcff',
  storageBucket: 'database-test-4bcff.appspot.com',
  messagingSenderId: '473532430470',
  appId: '1:473532430470:web:bf0261ce96ec26f7b07907',
  measurementId: 'G-JHGKJGQPJF',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)

export const fetchFirestoreData = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName))
    const data = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}))

    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    return []
  }
}
