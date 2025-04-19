import { styled } from '@mui/material/styles';
import { Box, Typography, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Expense } from '@fresh-expense/types';

const RowContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const AvatarContainer = styled(Box)({
  width: 40,
  height: 40,
  marginRight: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ContentContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
});

const MerchantName = styled(Typography)({
  width: '30%',
  fontWeight: 500,
});

const Amount = styled(Typography)({
  width: '20%',
  textAlign: 'right',
});

const Category = styled(Typography)({
  width: '15%',
  color: 'text.secondary',
});

const DateText = styled(Typography)({
  width: '15%',
  color: 'text.secondary',
});

interface ExpenseRowProps {
  expense: Expense;
}

export const ExpenseRow: React.FC<ExpenseRowProps> = ({ expense }) => {
  return (
    <RowContainer>
      <AvatarContainer>
        <Typography variant="h6" color="primary">
          {expense.merchant.charAt(0).toUpperCase()}
        </Typography>
      </AvatarContainer>
      <ContentContainer>
        <MerchantName variant="body1">{expense.merchant}</MerchantName>
        <Amount variant="body1">${expense.amount.toFixed(2)}</Amount>
        <Category variant="body2">{expense.category}</Category>
        <DateText variant="body2">{new Date(expense.date).toLocaleDateString()}</DateText>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" color="primary">
            <EditIcon />
          </IconButton>
          <IconButton size="small" color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </ContentContainer>
    </RowContainer>
  );
};
