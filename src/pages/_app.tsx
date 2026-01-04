import { Outlet } from 'react-router';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { theme, globalStyles } from '../theme';
import { AuthProvider } from '../contexts/AuthContext';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={globalStyles} />
      <CssBaseline />
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ThemeProvider>
  );
}
