import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, GithubAuthProvider,
  fetchSignInMethodsForEmail, linkWithCredential, OAuthCredential
} from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, setDoc, getDoc, onSnapshot, query, orderBy, increment } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAgN7evtASc7zyyD8FUVwXbsgwUBYejZmE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'stunivoz.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'stunivoz',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'stunivoz.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '758018830397',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:758018830397:web:2a0d13fa90ed60e0bdfa54',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-W4X81X98JJ',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result;
};

export const signInWithGitHub = async () => {
  const result = await signInWithPopup(auth, githubProvider);
  return result;
};

export const getSignInMethodsForEmail = async (email: string) => {
  return await fetchSignInMethodsForEmail(auth, email);
};

export const getCredentialFromError = (error: any, provider: 'google' | 'github'): OAuthCredential | null => {
  try {
    if (provider === 'google') return GoogleAuthProvider.credentialFromError(error);
    return GithubAuthProvider.credentialFromError(error);
  } catch {
    return null;
  }
};

export const linkPendingCredential = async (pendingCred: OAuthCredential) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No authenticated user to link credential to');
  return await linkWithCredential(currentUser, pendingCred);
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
    const { sendPasswordResetEmail } = await import('firebase/auth');
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const addDocument = async (collectionName: string, data: any) => {
  try {
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

export const getCollection = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

export const getDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    }
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error };
  }
};

export const setDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
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

export const incrementLoginCount = async (uid: string) => {
  try {
    const docRef = doc(db, 'profiles', uid);
    await updateDoc(docRef, { login_count: increment(1), last_login: new Date().toISOString() });
  } catch {
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

export const onAuthStateChangedListener = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const subscribeToCollection = (
  collectionName: string,
  callback: (docs: any[]) => void,
  onError?: (err: any) => void
) => {
  const q = query(collection(db, collectionName));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, onError);
};

export const saveApiConfig = async (config: any) => {
  try {
    const docRef = doc(db, 'system_config', 'ai_settings');
    await setDoc(docRef, { ...config, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const getApiConfig = async () => {
  try {
    const docRef = doc(db, 'system_config', 'ai_settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) return { success: true, data: snap.data() };
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error };
  }
};

export const saveAiHelpConfig = async (embedUrl: string) => {
  try {
    const docRef = doc(db, 'system_config', 'ai_help');
    await setDoc(docRef, { embedUrl, updatedAt: serverTimestamp() }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const getAiHelpConfig = async () => {
  try {
    const docRef = doc(db, 'system_config', 'ai_help');
    const snap = await getDoc(docRef);
    if (snap.exists()) return { success: true, data: snap.data() };
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error };
  }
};
