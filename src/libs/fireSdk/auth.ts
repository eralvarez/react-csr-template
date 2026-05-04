import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type UserCredential,
} from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './index';
import type { FnResponse } from 'types';
import { usersCollection, type User } from "db/collections";

/**
 * User profile data stored in Firestore
 */
export interface UserProfile {
  uid: string;
  email: string;
  fullName?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  deletedAt?: Timestamp | null;
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string,
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
export async function signUp({
  email,
  password,
  profile,
}: {
  email: string;
  password: string;
  profile: Partial<Omit<User, 'id' | 'authId' | 'createdAt' | 'updatedAt' | 'deletedAt'>>;
}): Promise<FnResponse<UserCredential, string>> {
  try {
    // Create the auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userProfile: Partial<User> = {
      // authId: user.uid,
      id: user.uid,
      email: email,
      fullName: profile.fullName,
    };

    // await setDoc(doc(db, 'users', user.uid), userProfile);
    // await usersCollection.create(userProfile as Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>);
    await usersCollection.create(userProfile);

    return { data: userCredential, error: null };
  } catch (err: any) {
    const errorMessage = err?.message || 'Failed to register';
    return { data: null, error: errorMessage };
  }
}
