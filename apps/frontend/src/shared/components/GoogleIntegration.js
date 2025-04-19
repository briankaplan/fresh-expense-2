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
exports.GoogleIntegration = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const notistack_1 = require("notistack");
const GoogleIntegration = () => {
  const [accounts, setAccounts] = (0, react_1.useState)([
    { email: "kaplan.brian@gmail.com", isConnected: false },
    { email: "brian@downhome.com", isConnected: false },
  ]);
  const [isSyncing, setIsSyncing] = (0, react_1.useState)(false);
  const [autoSync, setAutoSync] = (0, react_1.useState)(false);
  const { enqueueSnackbar } = (0, notistack_1.useSnackbar)();
  (0, react_1.useEffect)(() => {
    checkConnectionStatus();
  }, []);
  const checkConnectionStatus = async () => {
    try {
      // For each account, check if we have a valid refresh token
      const updatedAccounts = await Promise.all(
        accounts.map(async (account) => {
          try {
            const response = await fetch(`/api/google/auth-url?email=${account.email}`);
            const { success } = await response.json();
            return { ...account, isConnected: success };
          } catch (error) {
            return { ...account, isConnected: false };
          }
        }),
      );
      setAccounts(updatedAccounts);
    } catch (error) {
      console.error("Error checking connection status:", error);
    }
  };
  const handleConnect = async (email) => {
    try {
      const response = await fetch(`/api/google/auth-url?email=${email}`);
      const { success, url, error } = await response.json();
      if (success) {
        window.location.href = url;
      } else {
        enqueueSnackbar(`Error connecting to Google: ${error}`, {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Error connecting to Google", { variant: "error" });
      console.error("Error connecting to Google:", error);
    }
  };
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Sync receipts from both accounts
      const syncPromises = accounts
        .filter((account) => account.isConnected)
        .map((account) =>
          fetch(`/api/google/receipts?email=${account.email}&query=subject:receipt`),
        );
      const responses = await Promise.all(syncPromises);
      const results = await Promise.all(responses.map((r) => r.json()));
      const totalReceipts = results.reduce(
        (sum, result) => sum + (result.success ? result.messages.length : 0),
        0,
      );
      enqueueSnackbar(`Synced ${totalReceipts} receipts from ${results.length} accounts`, {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Error syncing data", { variant: "error" });
      console.error("Error syncing data:", error);
    } finally {
      setIsSyncing(false);
    }
  };
  const handleAutoSyncChange = (event) => {
    setAutoSync(event.target.checked);
    // TODO: Implement auto-sync logic
  };
  return (
    <material_1.Card>
      <material_1.CardContent>
        <material_1.Typography variant="h6" gutterBottom>
          Google Integration
        </material_1.Typography>

        {accounts.map((account) => (
          <material_1.Box key={account.email} sx={{ mb: 2 }}>
            <material_1.Typography variant="body1" color="text.secondary">
              {account.email}
            </material_1.Typography>
            <material_1.Button
              variant="contained"
              onClick={() => handleConnect(account.email)}
              disabled={account.isConnected}
              sx={{ mt: 1 }}
            >
              {account.isConnected ? "Connected" : "Connect Google Account"}
            </material_1.Button>
          </material_1.Box>
        ))}

        <material_1.Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <material_1.Button
            variant="outlined"
            onClick={handleSync}
            disabled={!accounts.some((a) => a.isConnected) || isSyncing}
            startIcon={isSyncing ? <material_1.CircularProgress size={20} /> : null}
          >
            {isSyncing ? "Syncing..." : "Sync Now"}
          </material_1.Button>
        </material_1.Box>

        <material_1.FormControlLabel
          control={
            <material_1.Switch
              checked={autoSync}
              onChange={handleAutoSyncChange}
              disabled={!accounts.some((a) => a.isConnected)}
            />
          }
          label="Auto-sync daily"
        />
      </material_1.CardContent>
    </material_1.Card>
  );
};
exports.GoogleIntegration = GoogleIntegration;
//# sourceMappingURL=GoogleIntegration.js.map
