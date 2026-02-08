import { ToggleButton, ToggleButtonGroup, IconButton, Box, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { VIEW_MODES } from '../../constants';
import './ViewToggle.scss';

const ViewToggle = ({
  viewMode,
  onViewModeChange,
  dateLabel,
  onPrevious,
  onNext,
  canNavigate = true
}) => {
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      onViewModeChange(newView);
    }
  };

  const showNavigation = canNavigate && viewMode !== VIEW_MODES.HISTORICAL;

  return (
    <div className="view-toggle">
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={handleViewChange}
        size="small"
        className="view-toggle__buttons"
      >
        <ToggleButton value={VIEW_MODES.WEEKLY}>Weekly</ToggleButton>
        <ToggleButton value={VIEW_MODES.BIWEEKLY}>Bi-weekly</ToggleButton>
        <ToggleButton value={VIEW_MODES.MONTHLY}>Monthly</ToggleButton>
        <ToggleButton value={VIEW_MODES.HISTORICAL}>All Time</ToggleButton>
      </ToggleButtonGroup>

      {showNavigation && (
        <Box className="view-toggle__navigation">
          <IconButton onClick={onPrevious} size="small" aria-label="Previous">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="body2" className="view-toggle__date-label">
            {dateLabel}
          </Typography>
          <IconButton onClick={onNext} size="small" aria-label="Next">
            <ChevronRightIcon />
          </IconButton>
        </Box>
      )}
    </div>
  );
};

export default ViewToggle;
