import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4A47A3', // Indigo
    },
    secondary: {
      main: '#70A9A1', // Teal
    },
    background: {
      default: '#F7F7F9', // Soft gray
      paper: '#FFFFFF',
    },
    text: {
      primary: '#343A40', // Dark charcoal
      secondary: '#6C757D',
    },
    error: {
      main: '#F44336',
    },
    success: {
      main: '#4CAF50',
    },
  },

  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
    },
    button: {
      fontFamily: '"Poppins", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      textTransform: 'none', // For a modern look, buttons aren't ALL CAPS
    }
  },

  shape: {
    borderRadius: 12, // Softer, more modern corners
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // Ensures all text fields are consistent
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)', // A subtle shadow for cards
        }
      }
    }
  },
});