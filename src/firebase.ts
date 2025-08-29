import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDLLvlVCHjhaWZty5PpJoWPdH8c7kBIr5Q",
  authDomain: "gudangpd-project.firebaseapp.com",
  projectId: "gudangpd-project",
  storageBucket: "gudangpd-project.firebasestorage.app",
  messagingSenderId: "259576155613",
  appId: "1:259576155613:web:a43b8cbdcb68384d5b3a34",
  measurementId: "G-HES67Z3Y5K"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
