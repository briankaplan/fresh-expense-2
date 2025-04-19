const __importDefault =
  (this && this.__importDefault) || ((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const store_1 = require("../store");
const LoadingOverlay = ({ message }) => {
  const isLoading = (0, store_1.useUIStore)((state) => state.isLoading);
  if (!isLoading) return null;
  return (
    <material_1.Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
      }}
      open={isLoading}
    >
      <material_1.CircularProgress color="primary" size={60} />
      {message && (
        <material_1.Box sx={{ textAlign: "center" }}>
          <material_1.Typography variant="h6" component="div">
            {message}
          </material_1.Typography>
        </material_1.Box>
      )}
    </material_1.Backdrop>
  );
};
exports.default = LoadingOverlay;
//# sourceMappingURL=LoadingOverlay.js.map
