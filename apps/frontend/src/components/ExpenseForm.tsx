import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';

interface ExpenseFormProps {
  expenseId?: string;
}

interface ExpenseFormData {
  date: Date | null;
  description: string;
  amount: string;
  category: string;
  notes: string;
}

const categories = [
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Travel',
  'Other',
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expenseId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ExpenseFormData>({
    date: new Date(),
    description: '',
    amount: '',
    category: '',
    notes: '',
  });

  useEffect(() => {
    if (expenseId) {
      // TODO: Fetch expense data if editing
      console.log('Fetching expense:', expenseId);
    }
  }, [expenseId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (expenseId) {
        // TODO: Update existing expense
        console.log('Updating expense:', expenseId, formData);
      } else {
        // TODO: Create new expense
        console.log('Creating expense:', formData);
      }
      navigate('/expenses');
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Date"
            value={formData.date}
            onChange={handleDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="amount"
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{
              step: '0.01',
              min: '0',
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="notes"
            label="Notes"
            value={formData.notes}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              type="button"
              onClick={() => navigate('/expenses')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              {expenseId ? 'Update' : 'Create'} Expense
            </Button>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default ExpenseForm; 