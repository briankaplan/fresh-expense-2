import type { Photo } from "@/services/photo.service";
import type React from "react";
interface PhotoBulkActionsProps {
  selectedPhotos: Photo[];
  onDelete: (photoIds: string[]) => void;
  onEdit: (photoIds: string[]) => void;
  onTag: (photoIds: string[], tags: string[]) => void;
  onShare: (photoIds: string[]) => void;
  onDownload: (photoIds: string[]) => void;
  availableTags: string[];
}
export declare function PhotoBulkActions({
  selectedPhotos,
  onDelete,
  onEdit,
  onTag,
  onShare,
  onDownload,
  availableTags,
}: PhotoBulkActionsProps): React.JSX.Element;
//# sourceMappingURL=PhotoBulkActions.d.ts.map
