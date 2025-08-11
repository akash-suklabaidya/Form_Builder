import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Tooltip } from '@mui/material';

export default function Navigation() {
  const navigate = useNavigate();
  const [showMyFormsTooltip, setShowMyFormsTooltip] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("showMyFormsTooltip") === "true") {
      localStorage.removeItem("showMyFormsTooltip");

      setTimeout(() => {
        setShowMyFormsTooltip(true);

        setTimeout(() => {
          setShowMyFormsTooltip(false);
        }, 4000);
      }, 200);
    }
  }, []);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Dynamic Form Builder
        </Typography>

        <Button color="inherit" onClick={() => navigate('/')}>
          Create
        </Button>

        <Tooltip
          title="View your saved forms here"
          open={showMyFormsTooltip}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          placement="bottom"
          arrow
        >
          <Button color="inherit" onClick={() => navigate('/myforms')}>
            My Forms
          </Button>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
