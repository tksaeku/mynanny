import { Tabs, Tab, Paper } from '@mui/material';
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
  const handleChange = (event, newValue) => {
    onTabChange(newValue);
  };

  return (
    <Paper className="tab-navigation" elevation={0}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
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
