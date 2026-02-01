import { useState } from 'react';
import { Paper, TextField, Button, Typography, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import './PasswordGate.scss';

const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY;
const PASSWORD = import.meta.env.VITE_PASSWORD;

export const isAuthenticated = () => {
  return localStorage.getItem(STORAGE_KEY) === PASSWORD;
};

export const setAuthenticated = () => {
  localStorage.setItem(STORAGE_KEY, PASSWORD);
};

export const clearAuthentication = () => {
  localStorage.removeItem(STORAGE_KEY);
};

const PasswordGate = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setAuthenticated();
      onSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="password-gate">
      <Paper className="password-gate__card" elevation={3}>
        <div className="password-gate__icon">
          <LockIcon />
        </div>
        <Typography variant="h5" className="password-gate__title">
          My Nanny
        </Typography>
        <Typography variant="body2" className="password-gate__subtitle">
          Enter password to continue
        </Typography>

        <form onSubmit={handleSubmit} className="password-gate__form">
          {error && (
            <Alert severity="error" className="password-gate__error">
              Incorrect password
            </Alert>
          )}
          <TextField
            type="password"
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            fullWidth
            autoFocus
            error={error}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={!password}
          >
            Unlock
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default PasswordGate;
