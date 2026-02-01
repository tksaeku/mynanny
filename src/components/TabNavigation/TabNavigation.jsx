import { useState } from 'react';
import {
  Tabs,
  Tab,
  Paper,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Box,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ReceiptIcon from '@mui/icons-material/Receipt';
import NotesIcon from '@mui/icons-material/Notes';
import './TabNavigation.scss';

const tabs = [
  { id: 'summary', label: 'Summary', icon: <HomeIcon /> },
  { id: 'hours', label: 'Hours', icon: <AccessTimeIcon /> },
  { id: 'mileage', label: 'Mileage', icon: <DirectionsCarIcon /> },
  { id: 'expenses', label: 'Expenses', icon: <ReceiptIcon /> },
  { id: 'notes', label: 'Notes', icon: <NotesIcon /> }
];

const TabNavigation = ({ activeTab, onTabChange }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = (event, newValue) => {
    onTabChange(newValue);
  };

  const handleDrawerItemClick = (tabId) => {
    onTabChange(tabId);
    setDrawerOpen(false);
  };

  const activeTabLabel = tabs.find((t) => t.id === activeTab)?.label || 'Summary';

  if (isMobile) {
    return (
      <>
        <Paper className="tab-navigation tab-navigation--mobile" elevation={0}>
          <IconButton
            onClick={() => setDrawerOpen(true)}
            className="tab-navigation__menu-btn"
            aria-label="Open menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="subtitle1" className="tab-navigation__current">
            {activeTabLabel}
          </Typography>
        </Paper>

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box className="tab-navigation__drawer">
            <Typography variant="h6" className="tab-navigation__drawer-title">
              My Nanny
            </Typography>
            <List>
              {tabs.map((tab) => (
                <ListItem key={tab.id} disablePadding>
                  <ListItemButton
                    selected={activeTab === tab.id}
                    onClick={() => handleDrawerItemClick(tab.id)}
                  >
                    <ListItemIcon>{tab.icon}</ListItemIcon>
                    <ListItemText primary={tab.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </>
    );
  }

  return (
    <Paper className="tab-navigation" elevation={0}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        className="tab-navigation__tabs"
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            className="tab-navigation__tab"
          />
        ))}
      </Tabs>
    </Paper>
  );
};

export default TabNavigation;
