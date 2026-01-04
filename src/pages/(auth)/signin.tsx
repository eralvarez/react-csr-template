import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Container,
  Paper,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { signinSchema, type SigninFormData } from '../../validations/auth';

const SigninPage = () => {
  const navigate = useNavigate();
  const { signin } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninFormData) => {
    try {
      setErrorMessage('');
      await signin(data.email, data.password);
      navigate('/app');
    } catch (error) {
      const firebaseError = error as { code?: string; message?: string };
      let message = 'Failed to sign in';

      if (firebaseError.code === 'auth/user-not-found') {
        message = 'No account found with this email address';
      } else if (firebaseError.code === 'auth/wrong-password') {
        message = 'Incorrect password';
      } else if (firebaseError.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (firebaseError.message) {
        message = firebaseError.message;
      }

      setErrorMessage(message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          sx={{
            width: '100%',
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Typography variant="h4" sx={{ textAlign: 'center' }}>
            Sign In
          </Typography>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              {...register('email')}
              label="Email"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isSubmitting}
            />

            <TextField
              {...register('password')}
              label="Password"
              type="password"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link
                to="/signup"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SigninPage;
