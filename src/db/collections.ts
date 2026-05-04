import { FirestoreCollection } from 'libs/fireSdk/orm';
import { db } from "libs/firebase";
// import * as yup from 'yup';

// Base validation model - flexible for create/update operations
// const userBaseModel = yup.object({
//   id: yup.string(),
//   fullName: yup.string(),
//   email: yup.string().email(),
//   createdAt: yup.date(),
//   updatedAt: yup.date(),
//   deletedAt: yup.date().nullable(),
// }).noUnknown(true, 'Unknown fields are not allowed');

// Complete User type for Firestore collection (explicit definition)
export type User = {
  // authId: string;
  id: string;
  fullName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

// Flexible validation schema - prevents extra props but keeps fields optional for create/update
// const userSchema = yup.object({
//   authId: yup.string(),
//   id: yup.string(),
//   fullName: yup.string(),
//   email: yup.string().email(),
//   createdAt: yup.date(),
//   updatedAt: yup.date(),
//   deletedAt: yup.date().nullable(),
// }).noUnknown(true, 'Unknown fields are not allowed');

// Collections - cast schema to User type for Firestore validation
export const usersCollection = FirestoreCollection.withSchema<User>(
  db,
  'users',
  // userSchema as yup.Schema<User>
);

