import { FirestoreCollection } from 'libs/fireSdk/orm';
import { db } from "libs/firebase";
import * as yup from 'yup';

// Base validation model - flexible for create/update operations
// const userBaseModel = yup.object({
//   id: yup.string(),
//   fullName: yup.string(),
//   email: yup.string().email(),
//   createdAt: yup.date(),
//   updatedAt: yup.date(),
//   deletedAt: yup.date().nullable(),
// }).noUnknown(true, 'Unknown fields are not allowed');

// Complete Firestore document schema - all fields required for stored documents
const userSchema = yup.object({
  id: yup.string(),
  fullName: yup.string(),
  email: yup.string().email(),
  createdAt: yup.date(),
  updatedAt: yup.date(),
  deletedAt: yup.date().nullable(),
}).noUnknown(true, 'Unknown fields are not allowed');

// Complete User type for Firestore collection
export type User = yup.InferType<typeof userSchema>;

// // Validation schemas for specific operations
// export const createUserSchema = userBaseModel.pick(['fullName', 'email']).shape({
//   fullName: yup.string().required('Full name is required'),
//   email: yup.string().email('Invalid email').required('Email is required'),
// });

// export const updateUserSchema = userBaseModel.pick(['fullName', 'email']).partial();

// Collections
export const usersCollection = FirestoreCollection.withSchema<User>(db, 'users', userSchema);

