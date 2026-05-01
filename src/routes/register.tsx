import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useActionData, useNavigation, useSubmit } from 'react-router';
import type { Route } from './+types/register';
import { handleFormActionError, successResponse, validateFormData } from '../utils/forms';

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
// export async function clientAction({ request }: Route.ClientActionArgs) {
//   const formData = await request.formData();

//   const rawValues = {
//     fullName: formData.get('fullName') as string,
//     email: formData.get('email') as string,
//     password: formData.get('password') as string,
//     repeatPassword: formData.get('repeatPassword') as string,
//   };

//   try {
//     const validated = await validateFormData(registerSchema, rawValues);

//     // Mock API call — replace with real registration logic
//     await new Promise((resolve) => setTimeout(resolve, 800));

//     console.log('Registering user:', { fullName: validated.fullName, email: validated.email });

//     return successResponse('Account created successfully!');
//   } catch (error) {
//     return handleFormActionError(error);
//   }
// }

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Create an account' }];
}

// --- Register page component ---
export default function Register() {
  // const navigation = useNavigation();
  // const isSubmitting = navigation.state === 'submitting';

  const { register, handleSubmit, formState, getValues } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    mode: 'onSubmit',
    defaultValues: {
      fullName: 'Rick Sanchez',
      email: 'rick@example.com',
      password: 'password',
      repeatPassword: 'passwordd',
    },
  });

  // React Hook Form handles client-side validation; the native form submit
  // triggers the clientAction for the mocked server-side validation layer.
  const onSubmit = async (formValues: RegisterFormValues) => {
    // const formValues = getValues();
    alert(JSON.stringify(formValues, null, 2));

    // submit(formValues, { method: 'post' });

    // try {
    const { data, error: formValidationError } = await validateFormData<RegisterFormValues>(
      formValues,
      registerSchema,
    );

    if (formValidationError) {
      console.error('Validation errors:', formValidationError);
      return;
    }

    // Mock API call — replace with real registration logic
    await new Promise((resolve) => setTimeout(resolve, 800));

    // console.log('Registering user:', { fullName: validated.fullName, email: validated.email });

    // return successResponse('Account created successfully!');
    // } catch (error) {
    //   return handleFormActionError(error);
    // }
  };

  return (
    <div>
      <div
        style={{
          maxWidth: '420px',
          margin: 'auto',
        }}
      >
        <hgroup>
          <h2>Create an account</h2>
          <p>Fill in the form below to get started.</p>
        </hgroup>

        <form method="post" onSubmit={handleSubmit(onSubmit)} noValidate>
          <fieldset>
            <label>
              Full name {String(formState.errors.fullName)}
              <input
                {...register('fullName')}
                type="text"
                id="fullName"
                placeholder="Jane Doe"
                autoComplete="name"
                aria-invalid={Boolean(formState.errors.fullName) ? 'true' : undefined}
                aria-describedby="fullname-helper"
              />
              {formState.errors.fullName?.message && (
                <small id="fullname-helper">{formState.errors.fullName?.message}</small>
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
                aria-invalid={Boolean(formState.errors.email) ? 'true' : undefined}
                aria-describedby="email-helper"
              />
              {formState.errors.email?.message && (
                <small id="email-helper">{formState.errors.email?.message}</small>
              )}
            </label>

            <label>
              Password
              <input
                {...register('password')}
                type="password"
                id="password"
                autoComplete="new-password"
                aria-invalid={Boolean(formState.errors.password) ? 'true' : undefined}
                aria-describedby="password-helper"
              />
              {formState.errors.password?.message && (
                <small id="password-helper">{formState.errors.password?.message}</small>
              )}
            </label>

            <label>
              Repeat password
              <input
                {...register('repeatPassword')}
                type="password"
                id="repeatPassword"
                autoComplete="new-password"
                aria-invalid={Boolean(formState.errors.repeatPassword) ? 'true' : undefined}
                aria-describedby="repeat-password-helper"
              />
              {formState.errors.repeatPassword?.message && (
                <small id="repeat-password-helper">
                  {formState.errors.repeatPassword?.message}
                </small>
              )}
            </label>
          </fieldset>

          <button
            type="submit"
            disabled={formState.isSubmitting}
            aria-busy={formState.isSubmitting ? 'true' : undefined}
          >
            {formState.isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
