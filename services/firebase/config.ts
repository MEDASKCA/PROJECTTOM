// Firebase configuration for PROJECT TOM
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Check if Firebase credentials are available
function isFirebaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'medaskca-93d48',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '0',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'placeholder',
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

// Initialize Firebase only once and only if configured
export function initializeFirebase() {
  if (!isFirebaseConfigured()) {
    console.warn('⚠️ Firebase credentials not configured');
    return { app: null, db: null, auth: null };
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } else {
    app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
  }
  return { app, db, auth };
}

// Singleton accessors
export function getFirebaseApp(): FirebaseApp | null {
  if (!app && isFirebaseConfigured()) {
    initializeFirebase();
  }
  return app;
}

export function getFirebaseDb(): Firestore {
  if (!db && isFirebaseConfigured()) {
    initializeFirebase();
  }
  if (!db) {
    throw new Error('Firebase not configured. Please set NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  }
  return db;
}

export function getFirebaseAuth(): Auth | null {
  if (!auth && isFirebaseConfigured()) {
    initializeFirebase();
  }
  return auth;
}
