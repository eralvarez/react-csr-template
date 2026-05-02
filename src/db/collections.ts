import { FirestoreCollection } from 'libs/fireSdk/orm';
import { db } from "libs/firebase";
import * as yup from 'yup';

// Models
const userModel = yup.object({
  id: yup.string(),
  fullName: yup.string(),
  email: yup.string().email().required(),
  createdAt: yup.date(),
  updatedAt: yup.date(),
  deletedAt: yup.date().nullable(),
});

export type User = yup.InferType<typeof userModel>;

// Collections
export const usersCollection = FirestoreCollection.withSchema<User>(db, 'users', userModel);

