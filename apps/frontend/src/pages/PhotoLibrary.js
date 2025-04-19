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
var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoLibrary = PhotoLibrary;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const photo_service_1 = __importDefault(require("@/services/photo.service"));
const PhotoBulkActions_1 = require("@/components/PhotoBulkActions");
function PhotoLibrary() {
  const [photos, setPhotos] = (0, react_1.useState)([]);
  const [selectedPhotos, setSelectedPhotos] = (0, react_1.useState)([]);
  const [loading, setLoading] = (0, react_1.useState)(true);
  const [error, setError] = (0, react_1.useState)("");
  const [availableTags, setAvailableTags] = (0, react_1.useState)([]);
  const photoService = photo_service_1.default.getInstance();
  (0, react_1.useEffect)(() => {
    loadPhotos();
    loadTags();
  }, []);
  const loadPhotos = async () => {
    try {
      setLoading(true);
      const response = await photoService.getPhotos({});
      setPhotos(response.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load photos";
      setError(errorMessage);
      console.error("Error loading photos:", err);
    } finally {
      setLoading(false);
    }
  };
  const loadTags = async () => {
    try {
      const tags = await photoService.getTags();
      setAvailableTags(tags);
    } catch (err) {
      console.error("Error loading tags:", err);
    }
  };
  const handleSelectPhoto = (photo) => {
    setSelectedPhotos((prev) => {
      const isSelected = prev.some((p) => p.id === photo.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== photo.id);
      }
      return [...prev, photo];
    });
  };
  const handleBulkDelete = async (photoIds) => {
    try {
      await photoService.bulkDeletePhotos(photoIds);
      setPhotos((prev) => prev.filter((photo) => !photoIds.includes(photo.id)));
      setSelectedPhotos((prev) => prev.filter((photo) => !photoIds.includes(photo.id)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete photos";
      setError(errorMessage);
      console.error("Error deleting photos:", err);
    }
  };
  const handleBulkEdit = async (photoIds) => {
    // Implement bulk edit functionality
    console.log("Bulk edit photos:", photoIds);
  };
  const handleBulkTag = async (photoIds, tags) => {
    try {
      await photoService.bulkAddTags(photoIds, tags);
      setPhotos((prev) =>
        prev.map((photo) => {
          if (photoIds.includes(photo.id)) {
            return { ...photo, tags: [...new Set([...photo.tags, ...tags])] };
          }
          return photo;
        }),
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add tags";
      setError(errorMessage);
      console.error("Error adding tags:", err);
    }
  };
  const handleBulkShare = async (photoIds) => {
    try {
      const shareUrl = await photoService.bulkSharePhotos(photoIds);
      // Implement share functionality
      console.log("Share URL:", shareUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to share photos";
      setError(errorMessage);
      console.error("Error sharing photos:", err);
    }
  };
  const handleBulkDownload = async (photoIds) => {
    try {
      await photoService.bulkDownloadPhotos(photoIds);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download photos";
      setError(errorMessage);
      console.error("Error downloading photos:", err);
    }
  };
  if (loading) {
    return (
      <material_1.Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <material_1.CircularProgress />
      </material_1.Box>
    );
  }
  if (error) {
    return (
      <material_1.Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </material_1.Alert>
    );
  }
  return (
    <material_1.Box>
      <material_1.Paper sx={{ p: 2, mb: 2 }}>
        <material_1.Box display="flex" justifyContent="space-between" alignItems="center">
          <material_1.Typography variant="h6">Photo Library</material_1.Typography>
          {selectedPhotos.length > 0 && (
            <PhotoBulkActions_1.PhotoBulkActions
              selectedPhotos={selectedPhotos}
              onDelete={handleBulkDelete}
              onEdit={handleBulkEdit}
              onTag={handleBulkTag}
              onShare={handleBulkShare}
              onDownload={handleBulkDownload}
              availableTags={availableTags}
            />
          )}
        </material_1.Box>
      </material_1.Paper>

      <material_1.Grid container spacing={2}>
        {photos.map((photo) => (
          <material_1.Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
            <material_1.Card
              sx={{
                position: "relative",
                "&:hover": {
                  boxShadow: 6,
                },
              }}
            >
              <material_1.Checkbox
                checked={selectedPhotos.some((p) => p.id === photo.id)}
                onChange={() => handleSelectPhoto(photo)}
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  zIndex: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "50%",
                }}
              />
              <material_1.CardMedia
                component="img"
                height="200"
                image={photo.url}
                alt={photo.filename}
                sx={{ objectFit: "cover" }}
              />
              <material_1.CardContent>
                <material_1.Typography variant="subtitle1" noWrap>
                  {photo.filename}
                </material_1.Typography>
                <material_1.Typography variant="body2" color="text.secondary">
                  {new Date(photo.uploadedAt).toLocaleDateString()}
                </material_1.Typography>
                <material_1.Box mt={1}>
                  {photo.tags.map((tag) => (
                    <material_1.Typography
                      key={tag}
                      variant="caption"
                      sx={{
                        mr: 1,
                        p: 0.5,
                        bgcolor: "primary.light",
                        color: "primary.contrastText",
                        borderRadius: 1,
                      }}
                    >
                      {tag}
                    </material_1.Typography>
                  ))}
                </material_1.Box>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>
        ))}
      </material_1.Grid>
    </material_1.Box>
  );
}
//# sourceMappingURL=PhotoLibrary.js.map
