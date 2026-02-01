import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import './FormDialog.scss';

const FormDialog = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Save',
  isSubmitting = false,
  maxWidth = 'sm'
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      className="form-dialog"
      classes={{ paper: 'form-dialog__paper' }}
    >
      <DialogTitle className="form-dialog__title">
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          className="form-dialog__close-btn"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent className="form-dialog__content">
          {children}
        </DialogContent>
        <DialogActions className="form-dialog__actions">
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FormDialog;
