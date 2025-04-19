var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const initialFormData = {
  name: "",
  description: "",
  merchant: "",
  amount: 0,
  billingCycle: "monthly",
  nextBillingDate: new Date(),
  category: "Software",
  type: "business",
  businessEntity: "Down Home",
  active: true,
  autoRenew: true,
  startDate: new Date(),
};
const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = (0, react_1.useState)([]);
  const [tabValue, setTabValue] = (0, react_1.useState)(0);
  const [selectedSubscription, setSelectedSubscription] = (0, react_1.useState)(null);
  const [dialogOpen, setDialogOpen] = (0, react_1.useState)(false);
  const [showPersonal, setShowPersonal] = (0, react_1.useState)(true);
  const [showBusiness, setShowBusiness] = (0, react_1.useState)(true);
  const [formData, setFormData] = (0, react_1.useState)(initialFormData);
  // Fetch subscriptions data
  (0, react_1.useEffect)(() => {
    // This would be an API call to your backend
    const mockSubscriptions = [
      {
        id: "1",
        name: "Adobe Creative Cloud",
        merchant: "Adobe",
        description: "Design software suite",
        amount: 52.99,
        billingCycle: "monthly",
        nextBillingDate: new Date("2025-05-10"),
        category: "Software",
        type: "business",
        businessEntity: "Down Home",
        active: true,
        autoRenew: true,
        startDate: new Date("2023-01-15"),
        lastBillingDate: new Date("2025-04-10"),
      },
      {
        id: "2",
        name: "Spotify Premium",
        merchant: "Spotify",
        amount: 9.99,
        billingCycle: "monthly",
        nextBillingDate: new Date("2025-05-03"),
        category: "Entertainment",
        type: "personal",
        active: true,
        autoRenew: true,
        startDate: new Date("2022-05-03"),
        lastBillingDate: new Date("2025-04-03"),
      },
      {
        id: "3",
        name: "Mailchimp",
        merchant: "Mailchimp",
        description: "Email marketing platform",
        amount: 79.99,
        billingCycle: "monthly",
        nextBillingDate: new Date("2025-04-21"),
        category: "Marketing",
        type: "business",
        businessEntity: "Music City Rodeo",
        active: true,
        autoRenew: true,
        startDate: new Date("2023-10-21"),
        lastBillingDate: new Date("2025-03-21"),
      },
    ];
    setSubscriptions(mockSubscriptions);
  }, []);
  // Calculate totals
  const businessTotal = subscriptions
    .filter((s) => s.type === "business" && s.active)
    .reduce((sum, curr) => sum + curr.amount, 0);
  const personalTotal = subscriptions
    .filter((s) => s.type === "personal" && s.active)
    .reduce((sum, curr) => sum + curr.amount, 0);
  const downHomeTotal = subscriptions
    .filter((s) => s.businessEntity === "Down Home" && s.active)
    .reduce((sum, curr) => sum + curr.amount, 0);
  const musicCityTotal = subscriptions
    .filter((s) => s.businessEntity === "Music City Rodeo" && s.active)
    .reduce((sum, curr) => sum + curr.amount, 0);
  const totalMonthly = subscriptions
    .filter((s) => s.active)
    .reduce((sum, curr) => sum + curr.amount, 0);
  // Filter subscriptions based on UI state
  const filteredSubscriptions = subscriptions.filter((s) => {
    if (s.type === "business" && !showBusiness) return false;
    if (s.type === "personal" && !showPersonal) return false;
    // Filter by tab
    if (tabValue === 1 && s.type !== "business") return false;
    if (tabValue === 2 && s.type !== "personal") return false;
    return true;
  });
  // Sort subscriptions by next billing date
  const sortedSubscriptions = [...filteredSubscriptions].sort(
    (a, b) => a.nextBillingDate.getTime() - b.nextBillingDate.getTime(),
  );
  const handleAddSubscription = () => {
    setSelectedSubscription(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };
  const handleEditSubscription = (subscription) => {
    setSelectedSubscription(subscription);
    setFormData(subscription);
    setDialogOpen(true);
  };
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = () => {
    if (selectedSubscription) {
      // Update existing subscription
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === selectedSubscription.id ? { ...formData, id: sub.id } : sub)),
      );
    } else {
      // Add new subscription
      setSubscriptions((prev) => [...prev, { ...formData, id: Date.now().toString() }]);
    }
    setDialogOpen(false);
  };
  return (
    <material_1.Box sx={{ width: "100%" }}>
      <material_1.Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <material_1.Typography variant="h5">Subscription Management</material_1.Typography>
        <material_1.Box>
          <material_1.IconButton
            sx={{ mr: 1 }}
            onClick={() => setShowPersonal(!showPersonal)}
            color={showPersonal ? "primary" : "default"}
            title={showPersonal ? "Hide Personal" : "Show Personal"}
          >
            <material_1.Chip
              label="Personal"
              color={showPersonal ? "primary" : "default"}
              variant={showPersonal ? "filled" : "outlined"}
              size="small"
            />
          </material_1.IconButton>

          <material_1.IconButton
            sx={{ mr: 2 }}
            onClick={() => setShowBusiness(!showBusiness)}
            color={showBusiness ? "secondary" : "default"}
            title={showBusiness ? "Hide Business" : "Show Business"}
          >
            <material_1.Chip
              label="Business"
              color={showBusiness ? "secondary" : "default"}
              variant={showBusiness ? "filled" : "outlined"}
              size="small"
            />
          </material_1.IconButton>

          <material_1.Button
            variant="contained"
            startIcon={<icons_material_1.Add />}
            onClick={handleAddSubscription}
          >
            Add Subscription
          </material_1.Button>
        </material_1.Box>
      </material_1.Box>

      {/* Summary Cards */}
      <material_1.Grid container spacing={3} sx={{ mb: 4 }}>
        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Card sx={{ p: 2 }}>
            <material_1.Typography variant="subtitle2" color="text.secondary">
              Total Monthly
            </material_1.Typography>
            <material_1.Typography variant="h4" sx={{ mt: 1 }}>
              ${totalMonthly.toFixed(2)}
            </material_1.Typography>
            <material_1.Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Active subscriptions: {subscriptions.filter((s) => s.active).length}
            </material_1.Typography>
          </material_1.Card>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Card sx={{ p: 2 }}>
            <material_1.Typography variant="subtitle2" color="text.secondary">
              Business Total
            </material_1.Typography>
            <material_1.Typography variant="h4" sx={{ mt: 1 }}>
              ${businessTotal.toFixed(2)}
            </material_1.Typography>
            <material_1.Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subscriptions.filter((s) => s.type === "business" && s.active).length} active
              subscriptions
            </material_1.Typography>
          </material_1.Card>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Card sx={{ p: 2 }}>
            <material_1.Typography variant="subtitle2" color="text.secondary">
              Down Home
            </material_1.Typography>
            <material_1.Typography variant="h4" sx={{ mt: 1 }}>
              ${downHomeTotal.toFixed(2)}
            </material_1.Typography>
            <material_1.Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {subscriptions.filter((s) => s.businessEntity === "Down Home" && s.active).length}{" "}
              subscriptions
            </material_1.Typography>
          </material_1.Card>
        </material_1.Grid>

        <material_1.Grid item xs={12} sm={6} md={3}>
          <material_1.Card sx={{ p: 2 }}>
            <material_1.Typography variant="subtitle2" color="text.secondary">
              Music City Rodeo
            </material_1.Typography>
            <material_1.Typography variant="h4" sx={{ mt: 1 }}>
              ${musicCityTotal.toFixed(2)}
            </material_1.Typography>
            <material_1.Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {
                subscriptions.filter((s) => s.businessEntity === "Music City Rodeo" && s.active)
                  .length
              }{" "}
              subscriptions
            </material_1.Typography>
          </material_1.Card>
        </material_1.Grid>
      </material_1.Grid>

      {/* Tabs */}
      <material_1.Paper sx={{ mb: 3 }}>
        <material_1.Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <material_1.Tab label="All Subscriptions" />
          <material_1.Tab label="Business" />
          <material_1.Tab label="Personal" />
        </material_1.Tabs>
      </material_1.Paper>

      {/* Subscriptions Table */}
      <material_1.TableContainer component={material_1.Paper}>
        <material_1.Table>
          <material_1.TableHead>
            <material_1.TableRow>
              <material_1.TableCell>Name</material_1.TableCell>
              <material_1.TableCell>Merchant</material_1.TableCell>
              <material_1.TableCell>Category</material_1.TableCell>
              <material_1.TableCell align="right">Amount</material_1.TableCell>
              <material_1.TableCell>Billing Cycle</material_1.TableCell>
              <material_1.TableCell>Next Billing</material_1.TableCell>
              <material_1.TableCell>Type</material_1.TableCell>
              <material_1.TableCell>Status</material_1.TableCell>
              <material_1.TableCell align="center">Actions</material_1.TableCell>
            </material_1.TableRow>
          </material_1.TableHead>
          <material_1.TableBody>
            {sortedSubscriptions.map((subscription) => (
              <material_1.TableRow
                key={subscription.id}
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                  opacity: subscription.active ? 1 : 0.5,
                }}
              >
                <material_1.TableCell>
                  <material_1.Typography variant="body2" fontWeight="medium">
                    {subscription.name}
                  </material_1.Typography>
                  {subscription.description && (
                    <material_1.Typography variant="caption" color="text.secondary">
                      {subscription.description}
                    </material_1.Typography>
                  )}
                </material_1.TableCell>
                <material_1.TableCell>{subscription.merchant}</material_1.TableCell>
                <material_1.TableCell>
                  <material_1.Chip label={subscription.category} size="small" variant="outlined" />
                </material_1.TableCell>
                <material_1.TableCell align="right">
                  ${subscription.amount.toFixed(2)}
                </material_1.TableCell>
                <material_1.TableCell>{subscription.billingCycle}</material_1.TableCell>
                <material_1.TableCell>
                  {subscription.nextBillingDate.toLocaleDateString()}
                </material_1.TableCell>
                <material_1.TableCell>
                  <material_1.Chip
                    label={
                      subscription.type === "business" ? subscription.businessEntity : "Personal"
                    }
                    size="small"
                    color={subscription.type === "business" ? "secondary" : "primary"}
                  />
                </material_1.TableCell>
                <material_1.TableCell>
                  <material_1.Chip
                    label={subscription.active ? "Active" : "Inactive"}
                    size="small"
                    color={subscription.active ? "success" : "default"}
                    variant="outlined"
                  />
                </material_1.TableCell>
                <material_1.TableCell align="center">
                  <material_1.IconButton
                    size="small"
                    onClick={() => handleEditSubscription(subscription)}
                  >
                    <icons_material_1.Edit fontSize="small" />
                  </material_1.IconButton>
                </material_1.TableCell>
              </material_1.TableRow>
            ))}
          </material_1.TableBody>
        </material_1.Table>
      </material_1.TableContainer>

      {/* Add/Edit Subscription Dialog */}
      <material_1.Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <material_1.DialogContent>
          <material_1.Typography variant="h6" sx={{ mb: 3 }}>
            {selectedSubscription ? "Edit Subscription" : "Add New Subscription"}
          </material_1.Typography>

          <material_1.Grid container spacing={2}>
            <material_1.Grid item xs={12}>
              <material_1.TextField
                label="Subscription Name"
                name="name"
                fullWidth
                value={formData.name}
                onChange={handleFormChange}
              />
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6}>
              <material_1.TextField
                label="Merchant"
                name="merchant"
                fullWidth
                value={formData.merchant}
                onChange={handleFormChange}
              />
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6}>
              <material_1.TextField
                label="Amount"
                name="amount"
                type="number"
                InputProps={{
                  startAdornment: "$",
                }}
                fullWidth
                value={formData.amount}
                onChange={handleFormChange}
              />
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6}>
              <material_1.TextField
                select
                label="Billing Cycle"
                name="billingCycle"
                fullWidth
                value={formData.billingCycle}
                onChange={handleFormChange}
              >
                <material_1.MenuItem value="monthly">Monthly</material_1.MenuItem>
                <material_1.MenuItem value="quarterly">Quarterly</material_1.MenuItem>
                <material_1.MenuItem value="annual">Annual</material_1.MenuItem>
                <material_1.MenuItem value="custom">Custom</material_1.MenuItem>
              </material_1.TextField>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6}>
              <material_1.TextField
                label="Next Billing Date"
                name="nextBillingDate"
                type="date"
                fullWidth
                value={formData.nextBillingDate.toISOString().split("T")[0]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    nextBillingDate: new Date(e.target.value),
                  }))
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6}>
              <material_1.TextField
                select
                label="Type"
                name="type"
                fullWidth
                value={formData.type}
                onChange={handleFormChange}
              >
                <material_1.MenuItem value="personal">Personal</material_1.MenuItem>
                <material_1.MenuItem value="business">Business</material_1.MenuItem>
              </material_1.TextField>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6}>
              <material_1.TextField
                select
                label="Business Entity"
                name="businessEntity"
                fullWidth
                value={formData.businessEntity}
                onChange={handleFormChange}
                disabled={formData.type === "personal"}
              >
                <material_1.MenuItem value="Down Home">Down Home</material_1.MenuItem>
                <material_1.MenuItem value="Music City Rodeo">Music City Rodeo</material_1.MenuItem>
              </material_1.TextField>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6}>
              <material_1.TextField
                select
                label="Category"
                name="category"
                fullWidth
                value={formData.category}
                onChange={handleFormChange}
              >
                <material_1.MenuItem value="Software">Software</material_1.MenuItem>
                <material_1.MenuItem value="Marketing">Marketing</material_1.MenuItem>
                <material_1.MenuItem value="Hosting">Hosting</material_1.MenuItem>
                <material_1.MenuItem value="Entertainment">Entertainment</material_1.MenuItem>
                <material_1.MenuItem value="Utilities">Utilities</material_1.MenuItem>
                <material_1.MenuItem value="Other">Other</material_1.MenuItem>
              </material_1.TextField>
            </material_1.Grid>

            <material_1.Grid item xs={12} sm={6}>
              <material_1.TextField
                select
                label="Status"
                name="active"
                fullWidth
                value={formData.active ? "active" : "inactive"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    active: e.target.value === "active",
                  }))
                }
              >
                <material_1.MenuItem value="active">Active</material_1.MenuItem>
                <material_1.MenuItem value="inactive">Inactive</material_1.MenuItem>
              </material_1.TextField>
            </material_1.Grid>

            <material_1.Grid item xs={12}>
              <material_1.TextField
                label="Description (Optional)"
                name="description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleFormChange}
              />
            </material_1.Grid>
          </material_1.Grid>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={() => setDialogOpen(false)}>Cancel</material_1.Button>
          <material_1.Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedSubscription ? "Save Changes" : "Add Subscription"}
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Box>
  );
};
exports.default = Subscriptions;
//# sourceMappingURL=Subscriptions.js.map
