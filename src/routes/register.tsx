import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useActionData, useNavigation, useSubmit } from 'react-router';
import type { Route } from './+types/register';
import { handleFormActionError, successResponse, validateFormData } from 'utils/forms';
import { signUp } from 'libs/fireSdk';
import { registerFormSchema, type RegisterFormValues } from 'utils/validations';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Create an account' }];
}

export default function Register() {
  const { register, handleSubmit, formState } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      fullName: 'Rick Sanchez',
      email: 'rick@example.com',
      password: 'password',
      repeatPassword: 'password',
    },
  });

  // React Hook Form handles client-side validation; the native form submit
  // triggers the clientAction for the mocked server-side validation layer.
  const onSubmit = async (formValues: RegisterFormValues) => {
    const { data, error: formValidationError } = await validateFormData<RegisterFormValues>(
      formValues,
      registerFormSchema,
    );

    if (formValidationError) {
      console.error('Validation errors:', formValidationError);
      return;
    }

    if (!data) {
      console.error('No data returned from validation');
      return;
    }

    const { fullName, email, password } = data;

    const { error: registrationError } = await signUp({
      email,
      password,
      profile: { fullName },
    });

    if (registrationError) {
      console.error('Registration error:', registrationError);
      return;
    }
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
