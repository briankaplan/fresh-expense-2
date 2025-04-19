import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const accountTypes = [
  { value: 'checking', label: 'Checking Account' },
  { value: 'savings', label: 'Savings Account' },
  { value: 'credit', label: 'Credit Card' },
];

interface AddAccountButtonProps {
  fullWidth?: boolean;
}

const AddAccountButton: React.FC<AddAccountButtonProps> = ({ fullWidth = false }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    institution: '',
    lastFour: '',
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement account creation logic
    console.log('Creating account:', formData);
    handleClose();
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpen}
        fullWidth={fullWidth}
      >
        Add Account
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Account</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                name="name"
                label="Account Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                name="type"
                label="Account Type"
                select
                value={formData.type}
                onChange={handleChange}
                fullWidth
                required
              >
                {accountTypes.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                name="institution"
                label="Financial Institution"
                value={formData.institution}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                name="lastFour"
                label="Last 4 Digits"
                value={formData.lastFour}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ maxLength: 4, pattern: '[0-9]*' }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add Account
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default AddAccountButton;
