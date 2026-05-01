import { data } from 'react-router';
import * as yup from 'yup';
import type { FnResponse } from 'types';

/**
 * Standard response shape for client actions handling forms
 */
export type FormActionResponse<TData = unknown> = {
  success: true;
  message: string;
  data?: TData;
} | {
  success: false;
  message: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Handles yup validation errors and returns a standardized error response
 */
export function handleYupValidationError(error: yup.ValidationError) {
  const fieldErrors = error.inner.reduce<Record<string, string>>((acc, err) => {
    if (err.path) acc[err.path] = err.message;
    return acc;
  }, {});

  return data<FormActionResponse>(
    { success: false, fieldErrors, message: '' },
    { status: 422 }
  );
}

/**
 * Returns a generic error response for unexpected errors
 */
export function handleUnexpectedError(message = 'Something went wrong. Please try again.') {
  return data<FormActionResponse>(
    { success: false, message },
    { status: 500 }
  );
}

/**
 * Returns a success response
 */
export function successResponse<TData = unknown>(
  message: string,
  responseData?: TData
) {
  return data<FormActionResponse<TData>>({
    success: true,
    message,
    data: responseData,
  });
}

/**
 * Validates form data against a yup schema and handles errors automatically
 * Returns FnResponse with validated data on success or error on failure
 */
export async function validateFormData<T>(
  rawData: unknown,
  schema: yup.Schema<T>,
): Promise<FnResponse<T, yup.ValidationError | string>> {
  try {
    const validatedData = await schema.validate(rawData, { abortEarly: false });
    const data = await schema.cast(validatedData, { stripUnknown: true });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof yup.ValidationError ? error : 'Validation failed' };
  }
}

/**
 * Catches and handles form action errors (yup validation or unexpected errors)
 * Use this in the catch block of clientAction functions
 */
export function handleFormActionError(error: unknown) {
  if (error instanceof yup.ValidationError) {
    return handleYupValidationError(error);
  }
  return handleUnexpectedError();
}
