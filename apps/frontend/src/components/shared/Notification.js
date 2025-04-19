Object.defineProperty(exports, "__esModule", { value: true });
exports.useNotification = useNotification;
exports.NotificationProvider = NotificationProvider;
const material_1 = require("@mui/material");
const react_1 = require("react");
const NotificationContext = (0, react_1.createContext)(undefined);
function useNotification() {
  const context = (0, react_1.useContext)(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
function NotificationProvider({ children }) {
  const [open, setOpen] = (0, react_1.useState)(false);
  const [message, setMessage] = (0, react_1.useState)("");
  const [severity, setSeverity] = (0, react_1.useState)("info");
  const showNotification = (message, severity) => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <material_1.Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <material_1.Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </material_1.Alert>
      </material_1.Snackbar>
    </NotificationContext.Provider>
  );
}
//# sourceMappingURL=Notification.js.map
