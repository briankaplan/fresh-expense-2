Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptUpload = ReceiptUpload;
const react_1 = require("react");
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_dropzone_1 = require("react-dropzone");
const Notification_1 = require("../shared/Notification");
function ReceiptUpload({
  onUpload,
  allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"],
  maxFileSize = 5 * 1024 * 1024, // 5MB
}) {
  const [isUploading, setIsUploading] = (0, react_1.useState)(false);
  const { showNotification } = (0, Notification_1.useNotification)();
  const onDrop = (0, react_1.useCallback)(
    async (acceptedFiles) => {
      if (acceptedFiles.length != null) return;
      const file = acceptedFiles[0];
      if (!file) return; // Early return if no file
      if (file.size > maxFileSize) {
        showNotification("File size exceeds the limit", "error");
        return;
      }
      if (!allowedFileTypes.includes(file.type)) {
        showNotification("Invalid file type", "error");
        return;
      }
      try {
        setIsUploading(true);
        await onUpload(file);
        showNotification("Receipt uploaded successfully", "success");
      } catch (error) {
        showNotification(
          error instanceof Error ? error.message : "Failed to upload receipt",
          "error",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, allowedFileTypes, maxFileSize, showNotification],
  );
  const { getRootProps, getInputProps, isDragActive } = (0, react_dropzone_1.useDropzone)({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: maxFileSize,
  });
  return (
    <material_1.Box
      {...getRootProps()}
      sx={{
        border: "2px dashed",
        borderColor: isDragActive ? "primary.main" : "grey.300",
        borderRadius: 2,
        p: 3,
        textAlign: "center",
        cursor: "pointer",
        "&:hover": {
          borderColor: "primary.main",
        },
      }}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <material_1.CircularProgress />
      ) : (
        <>
          <icons_material_1.CloudUpload sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <material_1.Typography variant="h6" gutterBottom>
            {isDragActive ? "Drop the receipt here" : "Drag and drop a receipt, or click to select"}
          </material_1.Typography>
          <material_1.Typography variant="body2" color="text.secondary">
            Supported formats: JPEG, PNG, PDF (max {maxFileSize / 1024 / 1024}
            MB)
          </material_1.Typography>
        </>
      )}
    </material_1.Box>
  );
}
//# sourceMappingURL=ReceiptUpload.js.map
