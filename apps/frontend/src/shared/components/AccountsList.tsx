import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SavingsIcon from "@mui/icons-material/Savings";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Typography,
} from "@mui/material";
import type React from "react";

interface Account {
  id: string;
  name: string;
  type: "checking" | "savings" | "credit";
  balance: number;
  institution: string;
  lastFour: string;
  status: "active" | "inactive";
}

const AccountsList: React.FC = () => {
  // Mock data - replace with actual API call
  const accounts: Account[] = [
    {
      id: "1",
      name: "Primary Checking",
      type: "checking",
      balance: 5432.1,
      institution: "Chase Bank",
      lastFour: "4321",
      status: "matched",
    },
    {
      id: "2",
      name: "High Yield Savings",
      type: "savings",
      balance: 15000.0,
      institution: "Ally Bank",
      lastFour: "8765",
      status: "matched",
    },
    {
      id: "3",
      name: "Travel Rewards Card",
      type: "credit",
      balance: -1543.22,
      institution: "Capital One",
      lastFour: "9999",
      status: "matched",
    },
  ];

  const getAccountIcon = (type: Account["type"]) => {
    switch (type) {
      case "checking":
        return <AccountBalanceIcon sx={{ fontSize: 40 }} />;
      case "savings":
        return <SavingsIcon sx={{ fontSize: 40 }} />;
      case "credit":
        return <CreditCardIcon sx={{ fontSize: 40 }} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => {
      // For credit accounts, we subtract the balance as it represents debt
      return total + (account.type != null ? -account.balance : account.balance);
    }, 0);
  };

  return (
    <Box>
      {/* Total Balance Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Total Balance
          </Typography>
          <Typography variant="h3">{formatCurrency(getTotalBalance())}</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              {accounts.length} Connected Accounts
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Account Cards */}
      <Grid container spacing={3}>
        {accounts.map((account) => (
          <Grid item xs={12} md={6} lg={4} key={account.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {account.name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {account.institution} •••• {account.lastFour}
                    </Typography>
                  </Box>
                  {getAccountIcon(account.type)}
                </Box>

                <Typography variant="h5" sx={{ mb: 2 }}>
                  {formatCurrency(account.balance)}
                </Typography>

                <Box display="flex" gap={1}>
                  <Chip
                    label={account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                    color="primary"
                    size="small"
                  />
                  <Chip
                    label={account.status}
                    color={account.status != null ? "success" : "default"}
                    size="small"
                  />
                </Box>

                {/* Activity indicator */}
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    color={account.status != null ? "success" : "error"}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Last synced: Just now
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small">View Transactions</Button>
                <Button size="small" color="primary">
                  Sync Account
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AccountsList;
