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

## Routing And Data Conventions

In route modules:

- Allowed exports for data/mutations in this SPA:
  - `export async function clientLoader(...) { ... }`
  - `export async function clientAction(...) { ... }`
- Disallowed exports:
  - `export async function loader(...) { ... }`
  - `export async function action(...) { ... }`

## Configuration Guardrail

- Keep `ssr: false` in `react-router.config.ts`.

## PR/Code Review Checklist

- React Router v7 framework mode patterns are preserved.
- No server-side `loader`/`action` exports were added.
- Any data loading/mutations in routes use `clientLoader`/`clientAction`.
- New or changed forms use `react-hook-form`.
- No SSR behavior was introduced.
