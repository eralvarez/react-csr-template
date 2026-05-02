import type { Firestore } from 'firebase/firestore';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy as firestoreOrderBy,
  limit as firestoreLimit,
  type WhereFilterOp,
  type OrderByDirection,
  Timestamp,
} from 'firebase/firestore';
import * as yup from 'yup';
import type { FnResponse } from 'types';

/**
 * Base document interface with required ORM fields
 * All Firestore documents must extend this interface
 */
export interface BaseDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Firestore where filter operators
 */
export type FirestoreWhereOperator = WhereFilterOp;

/**
 * Query constraint for where clauses
 */
interface WhereConstraint<T> {
  field: keyof T;
  operator: FirestoreWhereOperator;
  value: any;
}

/**
 * Query constraint for orderBy clauses
 */
interface OrderByConstraint<T> {
  field: keyof T;
  direction: OrderByDirection;
}

/**
 * ExecutableQuery type - a callable function with chainable methods
 * Usage: const findUsers = collection.get().where(...); const users = await findUsers();
 */
export interface ExecutableQuery<T extends BaseDocument> {
  (): Promise<FnResponse<T[], string>>;
  where(field: keyof T, operator: FirestoreWhereOperator, value: any): ExecutableQuery<T>;
  orderBy(field: keyof T, direction?: OrderByDirection): ExecutableQuery<T>;
  limit(count: number): ExecutableQuery<T>;
  includeDeleted(): ExecutableQuery<T>;
}

// ============================================================================
// Timestamp Conversion Utilities
// ============================================================================

/**
 * Converts Firestore Timestamp to JavaScript Date
 */
function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

/**
 * Converts JavaScript Date to Firestore Timestamp
 */
function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

/**
 * Recursively converts all Timestamp fields in a document to Date objects
 * Handles nested objects and arrays
 */
function convertTimestampsToDate<T>(doc: any): T {
  if (doc === null || doc === undefined) {
    return doc;
  }

  if (doc instanceof Timestamp) {
    return timestampToDate(doc) as any;
  }

  if (Array.isArray(doc)) {
    return doc.map((item) => convertTimestampsToDate(item)) as any;
  }

  if (typeof doc === 'object') {
    const converted: any = {};
    for (const key in doc) {
      if (Object.prototype.hasOwnProperty.call(doc, key)) {
        converted[key] = convertTimestampsToDate(doc[key]);
      }
    }
    return converted;
  }

  return doc;
}

/**
 * Recursively converts all Date fields in a document to Firestore Timestamps
 * Prepares document for writing to Firestore
 */
function convertDatesToTimestamp(doc: any): any {
  if (doc === null || doc === undefined) {
    return doc;
  }

  if (doc instanceof Date) {
    return dateToTimestamp(doc);
  }

  if (Array.isArray(doc)) {
    return doc.map((item) => convertDatesToTimestamp(item));
  }

  if (typeof doc === 'object' && !(doc instanceof Timestamp)) {
    const converted: any = {};
    for (const key in doc) {
      if (Object.prototype.hasOwnProperty.call(doc, key)) {
        converted[key] = convertDatesToTimestamp(doc[key]);
      }
    }
    return converted;
  }

  return doc;
}

// ============================================================================
// Document Validation Utility
// ============================================================================

/**
 * Validates and casts a document against a Yup schema
 * Strips unknown fields and returns null if validation fails
 * Logs warnings for invalid documents
 */
function validateDocument<T>(rawDoc: any, schema: yup.Schema<T>, docId?: string): T | null {
  try {
    const validated = schema.validateSync(rawDoc, { abortEarly: false, stripUnknown: true });
    return schema.cast(validated, { stripUnknown: true }) as T;
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      console.warn(
        `[FirestoreORM] Document validation failed${docId ? ` for id: ${docId}` : ''}:`,
        error.errors,
      );
    } else {
      console.warn(
        `[FirestoreORM] Unexpected validation error${docId ? ` for id: ${docId}` : ''}:`,
        error,
      );
    }
    return null;
  }
}

// ============================================================================
// ExecutableQuery Builder
// ============================================================================

/**
 * Creates an executable query function with chainable methods
 * @internal
 */
function createExecutableQuery<T extends BaseDocument>(
  db: Firestore,
  collectionName: string,
  schema: yup.Schema<T>,
): ExecutableQuery<T> {
  const whereConstraints: WhereConstraint<T>[] = [];
  const orderByConstraints: OrderByConstraint<T>[] = [];
  let limitValue: number | null = null;
  let includeDeletedFlag = false;

  /**
   * Executes the query and returns validated results
   */
  const execute = async (): Promise<FnResponse<T[], string>> => {
    try {
      const collectionRef = collection(db, collectionName);
      const constraints: any[] = [];

      // Apply soft-delete filter unless includeDeleted was called
      if (!includeDeletedFlag) {
        constraints.push(where('deletedAt', '==', null));
      }

      // Apply where constraints
      for (const constraint of whereConstraints) {
        constraints.push(where(constraint.field as string, constraint.operator, constraint.value));
      }

      // Apply orderBy constraints
      for (const constraint of orderByConstraints) {
        constraints.push(firestoreOrderBy(constraint.field as string, constraint.direction));
      }

      // Apply limit
      if (limitValue !== null) {
        constraints.push(firestoreLimit(limitValue));
      }

      // Build and execute query
      const q = query(collectionRef, ...constraints);
      const snapshot = await getDocs(q);

      // Process documents
      const documents: T[] = [];
      snapshot.forEach((docSnap) => {
        const rawData = docSnap.data();
        const dataWithId = { ...rawData, id: docSnap.id };

        // Convert Timestamps to Dates
        const convertedData = convertTimestampsToDate<T>(dataWithId);

        // Validate and filter
        const validatedDoc = validateDocument(convertedData, schema, docSnap.id);
        if (validatedDoc) {
          documents.push(validatedDoc);
        }
      });

      return { data: documents, error: null };
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to execute query';
      return { data: null, error: errorMessage };
    }
  };

  // Attach chainable methods to the execute function
  (execute as any).where = (
    field: keyof T,
    operator: FirestoreWhereOperator,
    value: any,
  ): ExecutableQuery<T> => {
    whereConstraints.push({ field, operator, value });
    return execute as ExecutableQuery<T>;
  };

  (execute as any).orderBy = (
    field: keyof T,
    direction: OrderByDirection = 'asc',
  ): ExecutableQuery<T> => {
    orderByConstraints.push({ field, direction });
    return execute as ExecutableQuery<T>;
  };

  (execute as any).limit = (count: number): ExecutableQuery<T> => {
    limitValue = count;
    return execute as ExecutableQuery<T>;
  };

  (execute as any).includeDeleted = (): ExecutableQuery<T> => {
    includeDeletedFlag = true;
    return execute as ExecutableQuery<T>;
  };

  return execute as ExecutableQuery<T>;
}

// ============================================================================
// FirestoreCollection Class
// ============================================================================

/**
 * Generic Firestore collection with ORM capabilities
 * Provides type-safe CRUD operations, soft-delete support, and automatic timestamp management
 *
 * @example
 * ```typescript
 * // Define your schema
 * const userSchema = yup.object({
 *   id: yup.string().required(),
 *   name: yup.string().required(),
 *   email: yup.string().email().required(),
 *   age: yup.number().required(),
 *   status: yup.string().oneOf(['active', 'inactive']).required(),
 *   createdAt: yup.date().required(),
 *   updatedAt: yup.date().required(),
 *   deletedAt: yup.date().nullable().required(),
 * });
 *
 * type User = yup.InferType<typeof userSchema>;
 *
 * // Create collection instance
 * const userCollection = FirestoreCollection.withSchema<User>(db, 'users', userSchema);
 *
 * // Create a document
 * const { data: user, error } = await userCollection.create({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   age: 30,
 *   status: 'active',
 * });
 *
 * // Query documents
 * const findActiveUsers = userCollection.get()
 *   .where('status', '==', 'active')
 *   .where('age', '>', 18)
 *   .orderBy('createdAt', 'desc')
 *   .limit(10);
 *
 * const { data: users, error } = await findActiveUsers();
 *
 * // Get by ID
 * const { data: user, error } = await userCollection.getById('user-id');
 *
 * // Update document
 * const { error } = await userCollection.update('user-id', { status: 'inactive' });
 *
 * // Soft delete
 * const { error } = await userCollection.softDelete('user-id');
 *
 * // Restore soft-deleted document
 * const { error } = await userCollection.restore('user-id');
 *
 * // Permanent delete
 * const { error } = await userCollection.delete('user-id');
 * ```
 */
export class FirestoreCollection<T extends BaseDocument> {
  private constructor(
    private db: Firestore,
    private collectionName: string,
    private schema: yup.Schema<T>,
  ) {}

  /**
   * Creates a new FirestoreCollection instance with schema validation
   *
   * @param db - Firestore database instance
   * @param collectionName - Name of the Firestore collection
   * @param schema - Yup schema for document validation
   * @returns FirestoreCollection instance
   *
   * @example
   * ```typescript
   * const userCollection = FirestoreCollection.withSchema<User>(db, 'users', userSchema);
   * ```
   */
  static withSchema<T extends BaseDocument>(
    db: Firestore,
    collectionName: string,
    schema: yup.Schema<T>,
  ): FirestoreCollection<T> {
    return new FirestoreCollection(db, collectionName, schema);
  }

  /**
   * Creates a new document in the collection
   * Auto-generates ID and populates createdAt, updatedAt, and deletedAt fields
   *
   * @param data - Document data (without id, createdAt, updatedAt, deletedAt)
   * @returns FnResponse with created document or error
   *
   * @example
   * ```typescript
   * const { data: user, error } = await userCollection.create({
   *   name: 'Jane Doe',
   *   email: 'jane@example.com',
   *   age: 25,
   *   status: 'active',
   * });
   * ```
   */
  async create(
    data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<FnResponse<T, string>> {
    try {
      // Generate new document reference
      const collectionRef = collection(this.db, this.collectionName);
      const docRef = doc(collectionRef);

      // Prepare document with ORM fields
      const now = Timestamp.now();
      const documentData = {
        ...data,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };

      // Convert any Date fields to Timestamps for storage
      // const firestoreData = convertDatesToTimestamp(documentData);

      // Validate before writing
      const validatedData = validateDocument(convertTimestampsToDate(documentData) as any, this.schema, docRef.id);
      if (!validatedData) {
        return { data: null, error: 'Document validation failed before create' };
      }

      // Write to Firestore
      await setDoc(docRef, documentData);

      // Return with Dates instead of Timestamps
      const resultData = convertTimestampsToDate<T>(documentData);
      return { data: resultData, error: null };
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create document';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Retrieves a document by ID
   * Returns null if document doesn't exist or is soft-deleted
   *
   * @param id - Document ID
   * @returns FnResponse with document or null
   *
   * @example
   * ```typescript
   * const { data: user, error } = await userCollection.getById('user-123');
   * if (data) {
   *   console.log('User:', data.name);
   * }
   * ```
   */
  async getById(id: string): Promise<FnResponse<T | null, string>> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { data: null, error: null };
      }

      const rawData = docSnap.data();
      const dataWithId = { ...rawData, id: docSnap.id };

      // Convert Timestamps to Dates
      const convertedData = convertTimestampsToDate<T>(dataWithId);

      // Check if soft-deleted
      if (convertedData.deletedAt !== null) {
        return { data: null, error: null };
      }

      // Validate
      const validatedDoc = validateDocument(convertedData, this.schema, id);
      if (!validatedDoc) {
        return { data: null, error: 'Document validation failed' };
      }

      return { data: validatedDoc, error: null };
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to get document';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Creates an executable query for retrieving multiple documents
   * Returns a chainable query builder that can be invoked to execute
   *
   * @returns ExecutableQuery instance
   *
   * @example
   * ```typescript
   * const findActiveUsers = userCollection.get()
   *   .where('status', '==', 'active')
   *   .where('age', '>', 18)
   *   .orderBy('createdAt', 'desc')
   *   .limit(10);
   *
   * const { data: users, error } = await findActiveUsers();
   * ```
   */
  get(): ExecutableQuery<T> {
    return createExecutableQuery(this.db, this.collectionName, this.schema);
  }

  /**
   * Updates a document by ID
   * Auto-updates the updatedAt field
   *
   * @param id - Document ID
   * @param data - Partial document data to update (cannot update id, createdAt, updatedAt, deletedAt)
   * @returns FnResponse with void or error
   *
   * @example
   * ```typescript
   * const { error } = await userCollection.update('user-123', {
   *   status: 'inactive',
   *   age: 31,
   * });
   * ```
   */
  async update(
    id: string,
    data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
  ): Promise<FnResponse<void, string>> {
    try {
      const docRef = doc(this.db, this.collectionName, id);

      // Auto-populate updatedAt
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      // Convert any Date fields to Timestamps
      const firestoreData = convertDatesToTimestamp(updateData);

      await updateDoc(docRef, firestoreData);

      return { data: undefined, error: null };
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update document';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Soft deletes a document by setting deletedAt to current timestamp
   * Soft-deleted documents are excluded from queries by default
   *
   * @param id - Document ID
   * @returns FnResponse with void or error
   *
   * @example
   * ```typescript
   * const { error } = await userCollection.softDelete('user-123');
   * ```
   */
  async softDelete(id: string): Promise<FnResponse<void, string>> {
    try {
      const docRef = doc(this.db, this.collectionName, id);

      await updateDoc(docRef, {
        deletedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return { data: undefined, error: null };
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to soft delete document';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Restores a soft-deleted document by setting deletedAt to null
   *
   * @param id - Document ID
   * @returns FnResponse with void or error
   *
   * @example
   * ```typescript
   * const { error } = await userCollection.restore('user-123');
   * ```
   */
  async restore(id: string): Promise<FnResponse<void, string>> {
    try {
      const docRef = doc(this.db, this.collectionName, id);

      await updateDoc(docRef, {
        deletedAt: null,
        updatedAt: Timestamp.now(),
      });

      return { data: undefined, error: null };
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to restore document';
      return { data: null, error: errorMessage };
    }
  }

  /**
   * Permanently deletes a document from Firestore
   * This operation cannot be undone
   *
   * @param id - Document ID
   * @returns FnResponse with void or error
   *
   * @example
   * ```typescript
   * const { error } = await userCollection.delete('user-123');
   * ```
   */
  async delete(id: string): Promise<FnResponse<void, string>> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      await deleteDoc(docRef);

      return { data: undefined, error: null };
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete document';
      return { data: null, error: errorMessage };
    }
  }
}

/**
 * USAGE EXAMPLES
 * ==============
 *
 * 1. Define your document schema with Yup:
 *
 * ```typescript
 * import * as yup from 'yup';
 * import { FirestoreCollection, BaseDocument } from './libs/fireSdk/orm';
 * import { db } from './libs/firebase';
 *
 * const userSchema = yup.object({
 *   id: yup.string().required(),
 *   name: yup.string().required().min(2).max(100),
 *   email: yup.string().email().required(),
 *   age: yup.number().required().positive().integer(),
 *   status: yup.string().oneOf(['active', 'inactive']).required(),
 *   createdAt: yup.date().required(),
 *   updatedAt: yup.date().required(),
 *   deletedAt: yup.date().nullable().required(),
 * });
 *
 * type User = yup.InferType<typeof userSchema>;
 * ```
 *
 * 2. Create a collection instance:
 *
 * ```typescript
 * const userCollection = FirestoreCollection.withSchema<User>(db, 'users', userSchema);
 * ```
 *
 * 3. Use CRUD operations:
 *
 * ```typescript
 * // CREATE
 * const { data: newUser, error: createError } = await userCollection.create({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   age: 30,
 *   status: 'active',
 * });
 *
 * if (createError) {
 *   console.error('Failed to create user:', createError);
 *   return;
 * }
 *
 * console.log('Created user:', newUser.id);
 *
 * // QUERY (with executable pattern)
 * const findActiveUsers = userCollection.get()
 *   .where('status', '==', 'active')
 *   .where('age', '>', 18)
 *   .orderBy('createdAt', 'desc')
 *   .limit(10);
 *
 * const { data: activeUsers, error: queryError } = await findActiveUsers();
 *
 * if (queryError) {
 *   console.error('Query failed:', queryError);
 *   return;
 * }
 *
 * console.log(`Found ${activeUsers.length} active users`);
 *
 * // GET BY ID
 * const { data: user, error: getError } = await userCollection.getById(newUser.id);
 *
 * if (getError) {
 *   console.error('Failed to get user:', getError);
 *   return;
 * }
 *
 * if (!user) {
 *   console.log('User not found');
 *   return;
 * }
 *
 * console.log('User:', user.name);
 *
 * // UPDATE
 * const { error: updateError } = await userCollection.update(user.id, {
 *   status: 'inactive',
 * });
 *
 * if (updateError) {
 *   console.error('Failed to update user:', updateError);
 *   return;
 * }
 *
 * // SOFT DELETE
 * const { error: softDeleteError } = await userCollection.softDelete(user.id);
 *
 * if (softDeleteError) {
 *   console.error('Failed to soft delete user:', softDeleteError);
 *   return;
 * }
 *
 * // Query won't return soft-deleted users by default
 * const findAllUsers = userCollection.get();
 * const { data: visibleUsers } = await findAllUsers();
 * console.log('Visible users:', visibleUsers.length); // Won't include soft-deleted
 *
 * // Include soft-deleted users in query
 * const findAllIncludingDeleted = userCollection.get().includeDeleted();
 * const { data: allUsers } = await findAllIncludingDeleted();
 * console.log('All users:', allUsers.length); // Includes soft-deleted
 *
 * // RESTORE
 * const { error: restoreError } = await userCollection.restore(user.id);
 *
 * if (restoreError) {
 *   console.error('Failed to restore user:', restoreError);
 *   return;
 * }
 *
 * // PERMANENT DELETE
 * const { error: deleteError } = await userCollection.delete(user.id);
 *
 * if (deleteError) {
 *   console.error('Failed to delete user:', deleteError);
 *   return;
 * }
 *
 * console.log('User permanently deleted');
 * ```
 *
 * NOTES:
 * ------
 * - All timestamp fields (createdAt, updatedAt, deletedAt) are automatically managed
 * - Timestamps are stored as Firestore Timestamps but read as JavaScript Dates
 * - Documents are validated against the schema on read/write
 * - Invalid fields are stripped (with console.warn)
 * - Soft-deleted documents are excluded from queries by default
 * - Use .includeDeleted() to include soft-deleted documents in queries
 * - All methods return FnResponse<T, string> for consistent error handling
 * - Complex queries may require composite indexes in Firestore (the error will tell you)
 */
