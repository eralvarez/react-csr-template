import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: '"Roboto", sans-serif',
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export const globalStyles = {
  '@keyframes gradientAnimation': {
    '0%': {
      backgroundPosition: '0% 50%',
    },
    '50%': {
      backgroundPosition: '100% 50%',
    },
    '100%': {
      backgroundPosition: '0% 50%',
    },
  },
  body: {
    background: 'linear-gradient(-45deg, #ffffff, #b7d2ffff, #ffffff, #b7d2ffff)',
    backgroundSize: '400% 400%',
    animation: 'gradientAnimation 15s ease infinite',
    margin: 0,
    padding: 0,
    minHeight: '100vh',
  },
};
