import {
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot,
  serverTimestamp, query, orderBy, Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface FirestoreInternship {
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  stipend: string;
  duration: string;
  skills: string;
  description: string;
  applyUrl: string;
  expiresAt: string;
  status: string;
  verified: boolean;
  applicants: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FirestoreEvent {
  id?: string;
  title: string;
  host: string;
  date: string;
  location: string;
  type: string;
  description: string;
  link: string;
  expiresAt: string;
  status: string;
  verified: boolean;
  registrations: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FirestoreCourse {
  id?: string;
  title: string;
  instructor: string;
  platform: string;
  category: string;
  duration: string;
  level: string;
  description: string;
  link: string;
  isFree: boolean;
  price: string;
  expiresAt: string;
  status: string;
  verified: boolean;
  students: number;
  rating: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export function subscribeToInternships(
  callback: (data: FirestoreInternship[]) => void
): () => void {
  const q = query(collection(db, 'internships'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snapshot => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreInternship));
    callback(data);
  }, () => callback([]));
}

export function subscribeToEvents(
  callback: (data: FirestoreEvent[]) => void
): () => void {
  const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snapshot => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreEvent));
    callback(data);
  }, () => callback([]));
}

export function subscribeToCourses(
  callback: (data: FirestoreCourse[]) => void
): () => void {
  const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snapshot => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreCourse));
    callback(data);
  }, () => callback([]));
}

export async function addInternship(data: Omit<FirestoreInternship, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'internships'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateInternship(id: string, data: Partial<FirestoreInternship>): Promise<void> {
  await updateDoc(doc(db, 'internships', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteInternship(id: string): Promise<void> {
  await deleteDoc(doc(db, 'internships', id));
}

export async function addEvent(data: Omit<FirestoreEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'events'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEvent(id: string, data: Partial<FirestoreEvent>): Promise<void> {
  await updateDoc(doc(db, 'events', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, 'events', id));
}

export async function addCourse(data: Omit<FirestoreCourse, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'courses'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCourse(id: string, data: Partial<FirestoreCourse>): Promise<void> {
  await updateDoc(doc(db, 'courses', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCourse(id: string): Promise<void> {
  await deleteDoc(doc(db, 'courses', id));
}

export async function deleteExpiredPosts(): Promise<number> {
  const now = new Date().toISOString().split('T')[0];
  let count = 0;

  const checkAndDelete = async (collectionName: string) => {
    const { getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, collectionName));
    for (const d of snap.docs) {
      const data = d.data();
      if (data.expiresAt && data.expiresAt < now) {
        await deleteDoc(doc(db, collectionName, d.id));
        count++;
      }
    }
  };

  await Promise.all([
    checkAndDelete('internships'),
    checkAndDelete('events'),
    checkAndDelete('courses'),
  ]);

  return count;
}
