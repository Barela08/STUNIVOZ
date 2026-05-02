/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  type User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
  query,
  where,
  getDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD...',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error };
  }
};

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error };
  }
};

export const loginWithGithub = async () => {
  try {
    const provider = new GithubAuthProvider();
    provider.addScope('user:email');
    const userCredential = await signInWithPopup(auth, provider);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error };
  }
};

export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const addDocument = async (collectionName: string, data: object) => {
  try {
    const dataWithId = data as { id?: unknown };

    if (typeof dataWithId.id === 'string' && dataWithId.id.length > 0) {
      await setDoc(doc(db, collectionName, dataWithId.id), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: dataWithId.id };
    }

    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error };
  }
};

export const getDocument = async (collectionName: string, id: string) => {
  try {
    const snapshot = await getDoc(doc(db, collectionName, id));
    if (!snapshot.exists()) {
      return { success: false, error: new Error('Document not found') };
    }
    return { success: true, data: { id: snapshot.id, ...snapshot.data() } };
  } catch (error) {
    return { success: false, error };
  }
};

export const getCollection = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = querySnapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data()
    }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

export const getCollectionWhere = async (
  collectionName: string,
  field: string,
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains',
  value: unknown
) => {
  try {
    const collectionQuery = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(collectionQuery);
    const data = querySnapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      ...snapshot.data()
    }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

export const updateDocument = async (
  collectionName: string,
  id: string,
  data: object
) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const uploadFile = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { success: true, url };
  } catch (error) {
    return { success: false, error };
  }
};

export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
