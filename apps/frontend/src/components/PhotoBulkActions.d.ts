import React from 'react';
import { Photo } from '@/services/photo.service';
interface PhotoBulkActionsProps {
    selectedPhotos: Photo[];
    onDelete: (photoIds: string[]) => void;
    onEdit: (photoIds: string[]) => void;
    onTag: (photoIds: string[], tags: string[]) => void;
    onShare: (photoIds: string[]) => void;
    onDownload: (photoIds: string[]) => void;
    availableTags: string[];
}
export declare function PhotoBulkActions({ selectedPhotos, onDelete, onEdit, onTag, onShare, onDownload, availableTags, }: PhotoBulkActionsProps): React.JSX.Element;
export {};
//# sourceMappingURL=PhotoBulkActions.d.ts.map