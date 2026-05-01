# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- ⚡️ Hot Module Replacement (HMR) with Vite 8
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations with React Router 7
- 🔒 TypeScript by default
- 🎨 Pico CSS + Sass for styling
- 🐳 Docker-ready for containerization
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

## Styling

This template uses [Pico CSS](https://picocss.com/) for minimal, classless styling combined with [Sass](https://sass-lang.com/) for custom styles. You can customize styles in `src/app.scss` or replace with your preferred CSS framework.

## AI Agent Skills

```shell
npx autoskills
```

## Examples

### Adding a new route with client data loading and client actions

Use React Router v7 framework mode with SPA-safe APIs (`clientLoader` and `clientAction`) and `react-hook-form` for form state:

```typescript
// src/routes/products.tsx
import { useSubmit } from 'react-router';
import { useForm } from 'react-hook-form';
import type { Route } from './+types/products';

type Product = {
  id: string;
  name: string;
};

type NewProductInput = {
  name: string;
};

export async function clientLoader() {
  const response = await fetch('/api/products');
  const products = (await response.json()) as Product[];
  return { products };
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const name = String(formData.get('name') ?? '').trim();

  if (!name) {
    return { ok: false, error: 'Name is required' };
  }

  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    return { ok: false, error: 'Could not create product' };
  }

  return { ok: true };
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Products' }];
}

export default function Products() {
  const { products } = Route.useLoaderData<typeof clientLoader>();
  const actionData = Route.useActionData<typeof clientAction>();
  const submit = useSubmit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewProductInput>({
    mode: 'onSubmit',
    defaultValues: { name: '' },
  });

  const onSubmit = (values: NewProductInput) => {
    const formData = new FormData();
    formData.set('name', values.name);
    submit(formData, { method: 'post' });
    reset();
  };

  return (
    <main>
      <h1>Products</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Use at least 2 characters' },
          })}
        />

        {errors.name?.message ? <p>{errors.name.message}</p> : null}
        {!errors.name?.message && actionData && !actionData.ok ? (
          <p>{actionData.error}</p>
        ) : null}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Create product'}
        </button>
      </form>

      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </main>
  );
}
```

### Testing with Playwright

When you add Playwright, use the web app testing skill:

```bash
# (after installing Playwright)
npm install @playwright/test -D
```

The testing skill provides patterns for:

- Reconnaissance (screenshot, DOM inspection)
- Selector discovery
- Server lifecycle management
- Automated checks

### Docker build optimization

The multi-stage Dockerfile skill guides optimized builds:

```dockerfile
# See existing Dockerfile for best practices on:
# - Layer caching
# - Build stages
# - Security (non-root users)
# - Minimal runtime images
```

---

Built with ❤️ using React Router, enhanced with AI agent skills.
