import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user) {
      navigate('/app');
    } else {
      navigate('/signin');
    }
  }, [user, loading, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default HomePage;
