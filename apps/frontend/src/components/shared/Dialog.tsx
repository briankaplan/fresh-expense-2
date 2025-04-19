import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { ReactNode, useState } from 'react';
import { useNotification } from './Notification';

interface DialogAction {
  label: string;
  onClick: () => Promise<void> | void;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'info' | 'warning';
  disabled?: boolean;
}

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: DialogAction[];
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  showCloseButton?: boolean;
  dividers?: boolean;
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  actions = [],
  maxWidth = 'sm',
  fullWidth = true,
  loading = false,
  showCloseButton = true,
  dividers = true,
}: DialogProps) {
  const { showNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (action: DialogAction) => {
    try {
      setIsSubmitting(true);
      await action.onClick();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'An error occurred', 'error');
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
      PaperProps={{
        sx: {
          minWidth: 300,
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">{title}</Typography>
          {showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: theme => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers={dividers}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
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
              variant={action.variant || 'contained'}
              color={action.color || 'primary'}
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
