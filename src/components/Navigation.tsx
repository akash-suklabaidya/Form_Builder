import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

export default function Navigation() {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Dynamic Form Builder
        </Typography>
        <Button color="inherit" onClick={() => navigate('/')}>
          Create
        </Button>
        <Button color="inherit" onClick={() => navigate('/myforms')}> {/* <-- Add this button */}
          My Forms
        </Button>
      </Toolbar>
    </AppBar>
  );
}