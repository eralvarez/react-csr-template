import { useNavigate } from 'react-router';
import { Box, Button, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { Logout } from '@mui/icons-material';

const AppPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 3,
        }}
      >
        <Typography variant="h4">App</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2">Logged in as: {user?.email}</Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </Box>
      </Box>
      <Typography>Welcome to the app section</Typography>
    </Box>
  );
};

export default AppPage;
