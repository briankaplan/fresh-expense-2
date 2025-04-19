Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingSpinner = void 0;
const material_1 = require("@mui/material");
const LoadingSpinner = ({
  message,
  fullScreen = false,
  size = 40,
  color = "primary",
  thickness = 4,
  sx,
  containerSx,
}) => {
  return (
    <material_1.Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: fullScreen ? "100vh" : "auto",
        p: 3,
        ...containerSx,
      }}
    >
      <material_1.CircularProgress size={size} color={color} thickness={thickness} sx={sx} />
      {message && (
        <material_1.Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {message}
        </material_1.Typography>
      )}
    </material_1.Box>
  );
};
exports.LoadingSpinner = LoadingSpinner;
//# sourceMappingURL=LoadingSpinner.js.map
