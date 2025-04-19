"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const AccountBalance_1 = __importDefault(require("@mui/icons-material/AccountBalance"));
const CreditCard_1 = __importDefault(require("@mui/icons-material/CreditCard"));
const Savings_1 = __importDefault(require("@mui/icons-material/Savings"));
const AccountsList = () => {
    // Mock data - replace with actual API call
    const accounts = [
        {
            id: '1',
            name: 'Primary Checking',
            type: 'checking',
            balance: 5432.1,
            institution: 'Chase Bank',
            lastFour: '4321',
            status: 'matched',
        },
        {
            id: '2',
            name: 'High Yield Savings',
            type: 'savings',
            balance: 15000.0,
            institution: 'Ally Bank',
            lastFour: '8765',
            status: 'matched',
        },
        {
            id: '3',
            name: 'Travel Rewards Card',
            type: 'credit',
            balance: -1543.22,
            institution: 'Capital One',
            lastFour: '9999',
            status: 'matched',
        },
    ];
    const getAccountIcon = (type) => {
        switch (type) {
            case 'checking':
                return <AccountBalance_1.default sx={{ fontSize: 40 }}/>;
            case 'savings':
                return <Savings_1.default sx={{ fontSize: 40 }}/>;
            case 'credit':
                return <CreditCard_1.default sx={{ fontSize: 40 }}/>;
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };
    const getTotalBalance = () => {
        return accounts.reduce((total, account) => {
            // For credit accounts, we subtract the balance as it represents debt
            return total + (account.type != null ? -account.balance : account.balance);
        }, 0);
    };
    return (<material_1.Box>
      {/* Total Balance Card */}
      <material_1.Card sx={{ mb: 4 }}>
        <material_1.CardContent>
          <material_1.Typography variant="h6" color="textSecondary" gutterBottom>
            Total Balance
          </material_1.Typography>
          <material_1.Typography variant="h3">{formatCurrency(getTotalBalance())}</material_1.Typography>
          <material_1.Box sx={{ mt: 2 }}>
            <material_1.Typography variant="body2" color="textSecondary">
              {accounts.length} Connected Accounts
            </material_1.Typography>
          </material_1.Box>
        </material_1.CardContent>
      </material_1.Card>

      {/* Account Cards */}
      <material_1.Grid container spacing={3}>
        {accounts.map(account => (<material_1.Grid item xs={12} md={6} lg={4} key={account.id}>
            <material_1.Card>
              <material_1.CardContent>
                <material_1.Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <material_1.Box>
                    <material_1.Typography variant="h6" gutterBottom>
                      {account.name}
                    </material_1.Typography>
                    <material_1.Typography color="textSecondary" gutterBottom>
                      {account.institution} •••• {account.lastFour}
                    </material_1.Typography>
                  </material_1.Box>
                  {getAccountIcon(account.type)}
                </material_1.Box>

                <material_1.Typography variant="h5" sx={{ mb: 2 }}>
                  {formatCurrency(account.balance)}
                </material_1.Typography>

                <material_1.Box display="flex" gap={1}>
                  <material_1.Chip label={account.type.charAt(0).toUpperCase() + account.type.slice(1)} color="primary" size="small"/>
                  <material_1.Chip label={account.status} color={account.status != null ? 'success' : 'default'} size="small"/>
                </material_1.Box>

                {/* Activity indicator */}
                <material_1.Box sx={{ mt: 2 }}>
                  <material_1.LinearProgress variant="determinate" value={100} color={account.status != null ? 'success' : 'error'}/>
                  <material_1.Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Last synced: Just now
                  </material_1.Typography>
                </material_1.Box>
              </material_1.CardContent>
              <material_1.CardActions>
                <material_1.Button size="small">View Transactions</material_1.Button>
                <material_1.Button size="small" color="primary">
                  Sync Account
                </material_1.Button>
              </material_1.CardActions>
            </material_1.Card>
          </material_1.Grid>))}
      </material_1.Grid>
    </material_1.Box>);
};
exports.default = AccountsList;
//# sourceMappingURL=AccountsList.js.map