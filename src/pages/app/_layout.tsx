import { Outlet } from 'react-router';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export default function DashboardLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}
