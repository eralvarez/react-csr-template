# AGENTS.md

## Project Rules (Mandatory)

This project is a React Router v7 **Framework Mode** SPA.

- Use React Router v7 with framework mode conventions only.
- Keep the app client-side rendered (SPA). Do not introduce SSR.
- For route data and mutations, use client-side APIs only:
  - `clientLoader`
  - `clientAction`
- Never use server-side route APIs in route modules:
  - `loader`
  - `action`
- Never add or rely on server runtime patterns (server handlers, server-only data fetching, or server form actions).

## Forms Standard

Use `react-hook-form` for all form state management and validation flows.

- Prefer `useForm`, `Controller`/`useController`, `useWatch`, and `FormProvider` where appropriate.
- Do not implement form state with ad-hoc `useState` trees for production forms.
- Do not use React Router `<Form>`/`fetcher.Form` as the primary form state solution for app forms.
- **Never use `clientAction` for form handling**. All form validation, state management, and submission logic must be handled inside the component using `react-hook-form`.

### Form Validation Best Practices

- Always validate form data using the `validateFormData` utility from `src/utils/forms.ts`.
- Pattern to follow (see `register.tsx` for reference):
  ```tsx
  const { data, error } = await validateFormData<FormValues>(formValues, schema);
  if (error) {
    // Handle validation errors
    return;
  }
  // Proceed with validated data
  ```
- Define Yup schemas outside components for resolver caching.
- Use the `FnResponse<TData, TError>` type for all functions that might throw exceptions (async operations, validation, API calls).
  ```tsx
  async function myAsyncFn(): Promise<FnResponse<User, string>> {
    try {
      const user = await fetchUser();
      return { data: user, error: null };
    } catch (err) {
      return { data: null, error: 'Failed to fetch user' };
    }
  }
  ```

## Routing And Data Conventions

In route modules:

- Allowed exports for data/mutations in this SPA:
  - `export async function clientLoader(...) { ... }` (for data fetching only)
  - **Do not use `clientAction` for forms** — handle all form logic within components using `react-hook-form`
- Disallowed exports:
  - `export async function loader(...) { ... }`
  - `export async function action(...) { ... }`
  - `export async function clientAction(...) { ... }` (for form handling)

## Configuration Guardrail

- Keep `ssr: false` in `react-router.config.ts`.

## PR/Code Review Checklist

- React Router v7 framework mode patterns are preserved.
- No server-side `loader`/`action` exports were added.
- Any data loading/mutations in routes use `clientLoader`/`clientAction`.
- New or changed forms use `react-hook-form`.
- No SSR behavior was introduced.
