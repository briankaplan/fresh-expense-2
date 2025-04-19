Object.defineProperty(exports, "__esModule", { value: true });
exports.Dialog = Dialog;
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_1 = require("react");
const Notification_1 = require("./Notification");
function Dialog({
  open,
  onClose,
  title,
  children,
  actions = [],
  maxWidth = "sm",
  fullWidth = true,
  loading = false,
  showCloseButton = true,
  dividers = true,
}) {
  const { showNotification } = (0, Notification_1.useNotification)();
  const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
  const handleAction = async (action) => {
    try {
      setIsSubmitting(true);
      await action.onClick();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <material_1.Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          minWidth: 300,
        },
      }}
    >
      <material_1.DialogTitle>
        <material_1.Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <material_1.Typography variant="h6">{title}</material_1.Typography>
          {showCloseButton && (
            <material_1.IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <icons_material_1.Close />
            </material_1.IconButton>
          )}
        </material_1.Box>
      </material_1.DialogTitle>

      <material_1.DialogContent dividers={dividers}>
        {loading ? (
          <material_1.Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <material_1.CircularProgress />
          </material_1.Box>
        ) : (
          children
        )}
      </material_1.DialogContent>

      {actions.length > 0 && (
        <material_1.DialogActions>
          {actions.map((action, index) => (
            <material_1.Button
              key={index}
              onClick={() => handleAction(action)}
              variant={action.variant || "contained"}
              color={action.color || "primary"}
              disabled={action.disabled || isSubmitting}
            >
              {action.label}
            </material_1.Button>
          ))}
        </material_1.DialogActions>
      )}
    </material_1.Dialog>
  );
}
//# sourceMappingURL=Dialog.js.map
