import { Outlet } from 'react-router';
import { Box, Typography } from '@mui/material';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';

export default function AppDashboardLayout() {
  return (
    <ProtectedRoute>
      <DashboardLayout
        headerContent={
          <Box>
            <Typography variant="h6">Welcome to Dashboard</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Manage your content and settings
            </Typography>
          </Box>
        }
      >
        <Outlet />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
