import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Paper,
  Box,
} from '@mui/material';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Paper elevation={2}>
      <List>
        {transactions.map((transaction) => (
          <ListItem key={transaction.id} divider>
            <ListItemText
              primary={transaction.description}
              secondary={
                <Box component="span" sx={{ display: 'flex', gap: 1 }}>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {formatDate(transaction.date)}
                  </Typography>
                  {transaction.category && (
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      • {transaction.category}
                    </Typography>
                  )}
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Typography
                variant="body2"
                color={transaction.amount < 0 ? 'error' : 'success.main'}
              >
                {formatCurrency(transaction.amount)}
              </Typography>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}; 