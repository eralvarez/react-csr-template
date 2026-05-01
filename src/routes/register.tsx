import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { data, useActionData, useNavigation } from 'react-router';
import type { Route } from './+types/register';

// --- Yup schema (defined outside component for resolver caching) ---
const registerSchema = yup.object({
  fullName: yup
    .string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters')
    .trim(),
  email: yup.string().required('Email is required').email('Enter a valid email address').trim(),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  // .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  // .matches(/[0-9]/, 'Password must contain at least one number'),
  repeatPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

type RegisterFormValues = yup.InferType<typeof registerSchema>;

// --- Mock clientAction ---
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();

  const rawValues = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    repeatPassword: formData.get('repeatPassword') as string,
  };

  try {
    const validated = await registerSchema.validate(rawValues, {
      abortEarly: false,
    });

    // Mock API call — replace with real registration logic
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log('Registering user:', { fullName: validated.fullName, email: validated.email });

    return data({ success: true, message: 'Account created successfully!' });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const fieldErrors = error.inner.reduce<Record<string, string>>((acc, err) => {
        if (err.path) acc[err.path] = err.message;
        return acc;
      }, {});
      return data({ success: false, fieldErrors, message: '' }, { status: 422 });
    }
    return data(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Create an account' }];
}

// --- Register page component ---
export default function Register() {
  const actionData = useActionData<typeof clientAction>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    mode: 'onSubmit',
    // reValidateMode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      repeatPassword: '',
    },
  });

  // React Hook Form handles client-side validation; the native form submit
  // triggers the clientAction for the mocked server-side validation layer.
  function onSubmit(_values: RegisterFormValues) {
    alert('Form submitted! Check console for details.');
    // handleSubmit passes here only when client-side validation passes.
    // The actual submission is handled natively by React Router's Form + clientAction.
    // This handler is intentionally empty — submission proceeds via the form action.
  }

  return (
    <div>
      <div
        style={{
          // width: '100%',
          maxWidth: '420px',
          margin: 'auto',
          // display: 'flex',
          // flexDirection: 'column',
          // gap: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>Create an account</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>
            Fill in the form below to get started.
          </p>
        </div>

        {actionData?.success && (
          <div
            role="alert"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              fontSize: '0.9rem',
            }}
          >
            {actionData.message}
          </div>
        )}

        {actionData && !actionData.success && actionData.message && (
          <div
            role="alert"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontSize: '0.9rem',
            }}
          >
            {actionData.message}
          </div>
        )}

        <form
          method="post"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          // style={{ display: 'flex', flexDirection: 'column' }}
        >
          <fieldset>
            <label>
              Full name {String(errors.fullName)}
              <input
                {...register('fullName')}
                type="text"
                id="fullName"
                placeholder="Jane Doe"
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName) ? 'true' : undefined}
                aria-describedby="fullname-helper"
              />
              {errors.fullName?.message && (
                <small id="fullname-helper">{errors.fullName?.message}</small>
              )}
            </label>

            <label>
              Email
              <input
                {...register('email')}
                type="email"
                id="email"
                placeholder="jane@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email) ? 'true' : undefined}
                aria-describedby="email-helper"
              />
              {errors.email?.message && <small id="email-helper">{errors.email?.message}</small>}
            </label>

            <label>
              Password
              <input
                {...register('password')}
                type="password"
                id="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password) ? 'true' : undefined}
                aria-describedby="password-helper"
              />
              {errors.password?.message && (
                <small id="password-helper">{errors.password?.message}</small>
              )}
            </label>

            <label>
              Repeat password
              <input
                {...register('repeatPassword')}
                type="password"
                id="repeatPassword"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.repeatPassword) ? 'true' : undefined}
                aria-describedby="repeat-password-helper"
              />
              {errors.repeatPassword?.message && (
                <small id="repeat-password-helper">{errors.repeatPassword?.message}</small>
              )}
            </label>
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting ? 'true' : undefined}
            // style={{
            //   background: isSubmitting ? '#9ca3af' : '#111827',
            //   // cursor: isSubmitting ? 'not-allowed' : 'pointer',
            // }}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
