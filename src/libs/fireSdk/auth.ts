import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type UserCredential,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from './index';
import type { FnResponse } from '../../types';

/**
 * User profile data stored in Firestore
 */
export interface UserProfile {
  uid: string;
  email: string;
  fullName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<FnResponse<UserCredential, string>> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { data: userCredential, error: null };
  } catch (err: any) {
    const errorMessage = err?.message || 'Failed to sign in';
    return { data: null, error: errorMessage };
  }
}

/**
 * Register/signUp new user with email and password
 * Also creates a profile document in the userProfile collection
 */
export async function signUp(
  { email,
    password,
    profile
  }: { email: string; password: string, profile: Partial<UserProfile> }
): Promise<FnResponse<UserCredential, string>> {
  try {
    // Create the auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create the profile document in Firestore using auth ID
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      ...profile,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    return { data: userCredential, error: null };
  } catch (err: any) {
    const errorMessage = err?.message || 'Failed to register';
    return { data: null, error: errorMessage };
  }
}
