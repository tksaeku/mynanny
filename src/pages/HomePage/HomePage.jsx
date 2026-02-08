import { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import SummaryPage from '../SummaryPage';
import PayStubPage from '../PayStubPage';
import './HomePage.scss';

const HomePage = ({
  hours,
  mileage,
  expenses,
  notes,
  pto,
  config,
  withholdings,
  employer,
  onBulkAdd
}) => {
  const [activeSubTab, setActiveSubTab] = useState('summary');

  const handleSubTabChange = (event, newValue) => {
    setActiveSubTab(newValue);
  };

  return (
    <div className="home-page">
      <Tabs
        value={activeSubTab}
        onChange={handleSubTabChange}
        centered
        className="home-page__sub-tabs"
      >
        <Tab label="Summary" value="summary" />
        <Tab label="Pay Stub" value="paystub" />
      </Tabs>

      {activeSubTab === 'summary' ? (
        <SummaryPage
          hours={hours}
          mileage={mileage}
          expenses={expenses}
          notes={notes}
          pto={pto}
          config={config}
          withholdings={withholdings}
          onBulkAdd={onBulkAdd}
        />
      ) : (
        <PayStubPage
          hours={hours}
          mileage={mileage}
          expenses={expenses}
          pto={pto}
          config={config}
          withholdings={withholdings}
          employer={employer}
        />
      )}
    </div>
  );
};

export default HomePage;
