const __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        let desc = Object.getOwnPropertyDescriptor(m, k);
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
const __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : (o, v) => {
        o.default = v;
      });
const __importStar =
  (this && this.__importStar) ||
  (() => {
    let ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          const ar = [];
          for (const k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod?.__esModule) return mod;
      const result = {};
      if (mod != null)
        for (let k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptUploader = ReceiptUploader;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const react_dropzone_1 = require("react-dropzone");
const react_hot_toast_1 = require("react-hot-toast");
function ReceiptUploader({ onUploadComplete, company }) {
  const [isUploading, setIsUploading] = (0, react_1.useState)(false);
  const [uploadProgress, setUploadProgress] = (0, react_1.useState)({});
  const { getRootProps, getInputProps, isDragActive } = (0, react_dropzone_1.useDropzone)({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".pdf"],
    },
    maxFiles: 10,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        if (company) {
          formData.append("company", company);
        }
        try {
          const response = await fetch("/api/receipts/upload", {
            method: "POST",
            body: formData,
          });
          if (!response.ok) throw new Error("Upload failed");
          const receipt = await response.json();
          return receipt;
        } catch (error) {
          console.error("Error uploading receipt:", error);
          react_hot_toast_1.toast.error(`Failed to upload ${file.name}`);
          return null;
        }
      });
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((result) => result !== null);
      if (successfulUploads.length > 0) {
        react_hot_toast_1.toast.success(
          `Successfully uploaded ${successfulUploads.length} receipt(s)`,
        );
        onUploadComplete?.(successfulUploads);
      }
      setIsUploading(false);
    },
  });
  return (
    <material_1.Paper
      {...getRootProps()}
      sx={{
        p: 3,
        border: "2px dashed",
        borderColor: isDragActive ? "primary.main" : "divider",
        backgroundColor: isDragActive ? "action.hover" : "background.paper",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <input {...getInputProps()} />
      <material_1.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        {isUploading ? (
          <>
            <material_1.CircularProgress />
            <material_1.Typography>Uploading receipts...</material_1.Typography>
          </>
        ) : (
          <>
            <icons_material_1.CloudUpload sx={{ fontSize: 48, color: "primary.main" }} />
            <material_1.Typography variant="h6">
              {isDragActive ? "Drop receipts here" : "Drag & drop receipts here"}
            </material_1.Typography>
            <material_1.Typography variant="body2" color="text.secondary">
              or click to select files
            </material_1.Typography>
            <material_1.Typography variant="caption" color="text.secondary">
              Supported formats: JPG, PNG, PDF
            </material_1.Typography>
          </>
        )}
      </material_1.Box>
    </material_1.Paper>
  );
}
//# sourceMappingURL=ReceiptUploader.js.map
