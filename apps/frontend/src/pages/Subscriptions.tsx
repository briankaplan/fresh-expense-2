import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

// Subscription type
interface Subscription {
  id: string;
  name: string;
  description?: string;
  merchant: string;
  amount: number;
  billingCycle: 'monthly' | 'quarterly' | 'annual' | 'custom';
  nextBillingDate: string;
  category: string;
  type: 'business' | 'personal';
  businessEntity?: 'Down Home' | 'Music City Rodeo';
  active: boolean;
  autoRenew: boolean;
  startDate: string;
  lastBillingDate?: string;
}

interface SubscriptionFormData extends Omit<Subscription, 'id'> {
  id?: string;
}

const initialFormData: SubscriptionFormData = {
  name: '',
  description: '',
  merchant: '',
  amount: 0,
  billingCycle: 'monthly',
  nextBillingDate: new Date().toISOString().split('T')[0],
  category: 'Software',
  type: 'business',
  businessEntity: 'Down Home',
  active: true,
  autoRenew: true,
  startDate: new Date().toISOString().split('T')[0],
};

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPersonal, setShowPersonal] = useState(true);
  const [showBusiness, setShowBusiness] = useState(true);
  const [formData, setFormData] = useState<SubscriptionFormData>(initialFormData);

  // Fetch subscriptions data
  useEffect(() => {
    // This would be an API call to your backend
    const mockSubscriptions: Subscription[] = [
      {
        id: '1',
        name: 'Adobe Creative Cloud',
        merchant: 'Adobe',
        description: 'Design software suite',
        amount: 52.99,
        billingCycle: 'monthly',
        nextBillingDate: '2025-05-10',
        category: 'Software',
        type: 'business',
        businessEntity: 'Down Home',
        active: true,
        autoRenew: true,
        startDate: '2023-01-15',
        lastBillingDate: '2025-04-10',
      },
      {
        id: '2',
        name: 'Spotify Premium',
        merchant: 'Spotify',
        amount: 9.99,
        billingCycle: 'monthly',
        nextBillingDate: '2025-05-03',
        category: 'Entertainment',
        type: 'personal',
        active: true,
        autoRenew: true,
        startDate: '2022-05-03',
        lastBillingDate: '2025-04-03',
      },
      {
        id: '3',
        name: 'Mailchimp',
        merchant: 'Mailchimp',
        description: 'Email marketing platform',
        amount: 79.99,
        billingCycle: 'monthly',
        nextBillingDate: '2025-04-21',
        category: 'Marketing',
        type: 'business',
        businessEntity: 'Music City Rodeo',
        active: true,
        autoRenew: true,
        startDate: '2023-10-21',
        lastBillingDate: '2025-03-21',
      },
    ];

    setSubscriptions(mockSubscriptions);
  }, []);

  // Calculate totals
  const businessTotal = subscriptions
    .filter(s => s.type === 'business' && s.active)
    .reduce((sum, curr) => sum + curr.amount, 0);

  const personalTotal = subscriptions
    .filter(s => s.type === 'personal' && s.active)
    .reduce((sum, curr) => sum + curr.amount, 0);

  const downHomeTotal = subscriptions
    .filter(s => s.businessEntity === 'Down Home' && s.active)
    .reduce((sum, curr) => sum + curr.amount, 0);

  const musicCityTotal = subscriptions
    .filter(s => s.businessEntity === 'Music City Rodeo' && s.active)
    .reduce((sum, curr) => sum + curr.amount, 0);

  const totalMonthly = subscriptions
    .filter(s => s.active)
    .reduce((sum, curr) => sum + curr.amount, 0);

  // Filter subscriptions based on UI state
  const filteredSubscriptions = subscriptions.filter(s => {
    if (s.type === 'business' && !showBusiness) return false;
    if (s.type === 'personal' && !showPersonal) return false;

    // Filter by tab
    if (tabValue === 1 && s.type !== 'business') return false;
    if (tabValue === 2 && s.type !== 'personal') return false;

    return true;
  });

  // Sort subscriptions by next billing date
  const sortedSubscriptions = [...filteredSubscriptions].sort(
    (a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
  );

  const handleAddSubscription = () => {
    setSelectedSubscription(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setFormData(subscription);
    setDialogOpen(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (selectedSubscription) {
      // Update existing subscription
      setSubscriptions(prev =>
        prev.map(sub => (sub.id === selectedSubscription.id ? { ...formData, id: sub.id } : sub))
      );
    } else {
      // Add new subscription
      setSubscriptions(prev => [...prev, { ...formData, id: Date.now().toString() }]);
    }
    setDialogOpen(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5">Subscription Management</Typography>
        <Box>
          <IconButton
            sx={{ mr: 1 }}
            onClick={() => setShowPersonal(!showPersonal)}
            color={showPersonal ? 'primary' : 'default'}
            title={showPersonal ? 'Hide Personal' : 'Show Personal'}
          >
            <Chip
              label="Personal"
              color={showPersonal ? 'primary' : 'default'}
              variant={showPersonal ? 'filled' : 'outlined'}
              size="small"
            />
          </IconButton>

          <IconButton
            sx={{ mr: 2 }}
            onClick={() => setShowBusiness(!showBusiness)}
            color={showBusiness ? 'secondary' : 'default'}
            title={showBusiness ? 'Hide Business' : 'Show Business'}
          >
            <Chip
              label="Business"
              color={showBusiness ? 'secondary' : 'default'}
              variant={showBusiness ? 'filled' : 'outlined'}
              size="small"
            />
          </IconButton>

          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddSubscription}>
            Add Subscription
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Monthly
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              ${totalMonthly.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Active subscriptions: {subscriptions.filter(s => s.active).length}
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Business Total
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              ${businessTotal.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subscriptions.filter(s => s.type === 'business' && s.active).length} active
              subscriptions
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Down Home
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              ${downHomeTotal.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subscriptions.filter(s => s.businessEntity === 'Down Home' && s.active).length}{' '}
              subscriptions
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Music City Rodeo
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              ${musicCityTotal.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {
                subscriptions.filter(s => s.businessEntity === 'Music City Rodeo' && s.active)
                  .length
              }{' '}
              subscriptions
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All Subscriptions" />
          <Tab label="Business" />
          <Tab label="Personal" />
        </Tabs>
      </Paper>

      {/* Subscriptions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Merchant</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Billing Cycle</TableCell>
              <TableCell>Next Billing</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedSubscriptions.map(subscription => (
              <TableRow
                key={subscription.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                  opacity: subscription.active ? 1 : 0.5,
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {subscription.name}
                  </Typography>
                  {subscription.description && (
                    <Typography variant="caption" color="text.secondary">
                      {subscription.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{subscription.merchant}</TableCell>
                <TableCell>
                  <Chip label={subscription.category} size="small" variant="outlined" />
                </TableCell>
                <TableCell align="right">${subscription.amount.toFixed(2)}</TableCell>
                <TableCell>{subscription.billingCycle}</TableCell>
                <TableCell>{new Date(subscription.nextBillingDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={
                      subscription.type === 'business' ? subscription.businessEntity : 'Personal'
                    }
                    size="small"
                    color={subscription.type === 'business' ? 'secondary' : 'primary'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={subscription.active ? 'Active' : 'Inactive'}
                    size="small"
                    color={subscription.active ? 'success' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleEditSubscription(subscription)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Subscription Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {selectedSubscription ? 'Edit Subscription' : 'Add New Subscription'}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Subscription Name"
                name="name"
                fullWidth
                value={formData.name}
                onChange={handleFormChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Merchant"
                name="merchant"
                fullWidth
                value={formData.merchant}
                onChange={handleFormChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount"
                name="amount"
                type="number"
                InputProps={{
                  startAdornment: '$',
                }}
                fullWidth
                value={formData.amount}
                onChange={handleFormChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Billing Cycle"
                name="billingCycle"
                fullWidth
                value={formData.billingCycle}
                onChange={handleFormChange}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="annual">Annual</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Next Billing Date"
                name="nextBillingDate"
                type="date"
                fullWidth
                value={formData.nextBillingDate}
                onChange={handleFormChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Type"
                name="type"
                fullWidth
                value={formData.type}
                onChange={handleFormChange}
              >
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="business">Business</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Business Entity"
                name="businessEntity"
                fullWidth
                value={formData.businessEntity}
                onChange={handleFormChange}
                disabled={formData.type === 'personal'}
              >
                <MenuItem value="Down Home">Down Home</MenuItem>
                <MenuItem value="Music City Rodeo">Music City Rodeo</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Category"
                name="category"
                fullWidth
                value={formData.category}
                onChange={handleFormChange}
              >
                <MenuItem value="Software">Software</MenuItem>
                <MenuItem value="Marketing">Marketing</MenuItem>
                <MenuItem value="Hosting">Hosting</MenuItem>
                <MenuItem value="Entertainment">Entertainment</MenuItem>
                <MenuItem value="Utilities">Utilities</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status"
                name="active"
                fullWidth
                value={formData.active ? 'active' : 'inactive'}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    active: e.target.value === 'active',
                  }))
                }
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description (Optional)"
                name="description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleFormChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedSubscription ? 'Save Changes' : 'Add Subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Subscriptions;
