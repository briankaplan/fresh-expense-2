import { Close as CloseIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  IconButton,
  Dialog as MuiDialog,
  Slide,
  Typography,
  Zoom,
  useTheme,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { type ReactElement, type ReactNode, type Ref, forwardRef, useState } from "react";
import { useNotification } from "../Notification";

// Types
interface DialogAction {
  label: string;
  onClick: () => Promise<void> | void;
  variant?: "text" | "outlined" | "contained";
  color?: "primary" | "secondary" | "error" | "success" | "info" | "warning";
  disabled?: boolean;
}

interface BaseDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: DialogAction[];
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  loading?: boolean;
  showCloseButton?: boolean;
  dividers?: boolean;
  transition?: "slide" | "fade" | "zoom";
  direction?: "up" | "down" | "left" | "right";
  fullScreen?: boolean;
}

// Transitions
const SlideTransition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FadeTransition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement },
  ref: Ref<unknown>,
) {
  return <Fade ref={ref} {...props} />;
});

const ZoomTransition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement },
  ref: Ref<unknown>,
) {
  return <Zoom ref={ref} {...props} />;
});

// Base Dialog Component
export function Dialog({
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
  transition = "slide",
  direction = "up",
  fullScreen = false,
}: BaseDialogProps) {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTransition = () => {
    switch (transition) {
      case "slide":
        return SlideTransition;
      case "fade":
        return FadeTransition;
      case "zoom":
        return ZoomTransition;
      default:
        return SlideTransition;
    }
  };

  const handleAction = async (action: DialogAction) => {
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
    <MuiDialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      TransitionComponent={getTransition()}
      PaperProps={{
        sx: {
          minWidth: 300,
          bgcolor: theme.palette.background.paper,
          ...(fullScreen && {
            margin: 0,
            height: "100%",
          }),
        },
      }}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <DialogTitle id="dialog-title">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">{title}</Typography>
          {showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
                "&:hover": {
                  color: (theme) => theme.palette.grey[700],
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers={dividers} id="dialog-description">
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          children
        )}
      </DialogContent>

      {actions.length > 0 && (
        <DialogActions>
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={() => handleAction(action)}
              variant={action.variant || "contained"}
              color={action.color || "primary"}
              disabled={action.disabled || isSubmitting}
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </MuiDialog>
  );
}

// Confirmation Dialog
interface ConfirmationDialogProps extends Omit<BaseDialogProps, "children" | "actions"> {
  message: string;
  onConfirm: () => Promise<void> | void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: DialogAction["color"];
}

export function ConfirmationDialog({
  message,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "error",
  onClose,
  ...props
}: ConfirmationDialogProps) {
  return (
    <Dialog
      {...props}
      onClose={onClose}
      actions={[
        {
          label: cancelText,
          onClick: onClose,
          variant: "text",
        },
        {
          label: confirmText,
          onClick: onConfirm,
          color: confirmColor,
        },
      ]}
    >
      <Typography>{message}</Typography>
    </Dialog>
  );
}

// Alert Dialog
interface AlertDialogProps extends Omit<BaseDialogProps, "children" | "actions"> {
  message: string;
  severity?: "success" | "info" | "warning" | "error";
}

export function AlertDialog({ message, severity = "info", onClose, ...props }: AlertDialogProps) {
  return (
    <Dialog
      {...props}
      onClose={onClose}
      actions={[
        {
          label: "OK",
          onClick: onClose,
          color: severity,
        },
      ]}
    >
      <Typography color={severity}>{message}</Typography>
    </Dialog>
  );
}

// Full Screen Dialog
interface FullScreenDialogProps extends Omit<BaseDialogProps, "fullScreen"> {
  children: ReactNode;
}

export function FullScreenDialog({ onClose, ...props }: FullScreenDialogProps) {
  return <Dialog {...props} onClose={onClose} fullScreen />;
}
