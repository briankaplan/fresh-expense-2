"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dialog = Dialog;
exports.ConfirmationDialog = ConfirmationDialog;
exports.AlertDialog = AlertDialog;
exports.FullScreenDialog = FullScreenDialog;
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_1 = require("react");
const Notification_1 = require("../Notification");
// Transitions
const SlideTransition = (0, react_1.forwardRef)(function Transition(props, ref) {
    return <material_1.Slide direction="up" ref={ref} {...props}/>;
});
const FadeTransition = (0, react_1.forwardRef)(function Transition(props, ref) {
    return <material_1.Fade ref={ref} {...props}/>;
});
const ZoomTransition = (0, react_1.forwardRef)(function Transition(props, ref) {
    return <material_1.Zoom ref={ref} {...props}/>;
});
// Base Dialog Component
function Dialog({ open, onClose, title, children, actions = [], maxWidth = 'sm', fullWidth = true, loading = false, showCloseButton = true, dividers = true, transition = 'slide', direction = 'up', fullScreen = false, }) {
    const theme = (0, material_1.useTheme)();
    const { showNotification } = (0, Notification_1.useNotification)();
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const getTransition = () => {
        switch (transition) {
            case 'slide':
                return SlideTransition;
            case 'fade':
                return FadeTransition;
            case 'zoom':
                return ZoomTransition;
            default:
                return SlideTransition;
        }
    };
    const handleAction = async (action) => {
        try {
            setIsSubmitting(true);
            await action.onClick();
        }
        catch (error) {
            showNotification(error instanceof Error ? error.message : 'An error occurred', 'error');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (<material_1.Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth} fullScreen={fullScreen} TransitionComponent={getTransition()} PaperProps={{
            sx: {
                minWidth: 300,
                bgcolor: theme.palette.background.paper,
                ...(fullScreen && {
                    margin: 0,
                    height: '100%',
                }),
            },
        }} aria-labelledby="dialog-title" aria-describedby="dialog-description">
      <material_1.DialogTitle id="dialog-title">
        <material_1.Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}>
          <material_1.Typography variant="h6">{title}</material_1.Typography>
          {showCloseButton && (<material_1.IconButton aria-label="close" onClick={onClose} sx={{
                color: theme => theme.palette.grey[500],
                '&:hover': {
                    color: theme => theme.palette.grey[700],
                },
            }}>
              <icons_material_1.Close />
            </material_1.IconButton>)}
        </material_1.Box>
      </material_1.DialogTitle>

      <material_1.DialogContent dividers={dividers} id="dialog-description">
        {loading ? (<material_1.Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
            }}>
            <material_1.CircularProgress />
          </material_1.Box>) : (children)}
      </material_1.DialogContent>

      {actions.length > 0 && (<material_1.DialogActions>
          {actions.map((action, index) => (<material_1.Button key={index} onClick={() => handleAction(action)} variant={action.variant || 'contained'} color={action.color || 'primary'} disabled={action.disabled || isSubmitting}>
              {action.label}
            </material_1.Button>))}
        </material_1.DialogActions>)}
    </material_1.Dialog>);
}
function ConfirmationDialog({ message, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel', confirmColor = 'error', onClose, ...props }) {
    return (<Dialog {...props} onClose={onClose} actions={[
            {
                label: cancelText,
                onClick: onClose,
                variant: 'text',
            },
            {
                label: confirmText,
                onClick: onConfirm,
                color: confirmColor,
            },
        ]}>
      <material_1.Typography>{message}</material_1.Typography>
    </Dialog>);
}
function AlertDialog({ message, severity = 'info', onClose, ...props }) {
    return (<Dialog {...props} onClose={onClose} actions={[
            {
                label: 'OK',
                onClick: onClose,
                color: severity,
            },
        ]}>
      <material_1.Typography color={severity}>{message}</material_1.Typography>
    </Dialog>);
}
function FullScreenDialog({ onClose, ...props }) {
    return <Dialog {...props} onClose={onClose} fullScreen/>;
}
//# sourceMappingURL=index.js.map