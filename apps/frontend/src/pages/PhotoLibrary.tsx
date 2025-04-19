import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Checkbox,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import PhotoService, { Photo } from '@/services/photo.service';
import { PhotoBulkActions } from '@/components/PhotoBulkActions';

export function PhotoLibrary() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const photoService = PhotoService.getInstance();

  useEffect(() => {
    loadPhotos();
    loadTags();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const response = await photoService.getPhotos({});
      setPhotos(response.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load photos';
      setError(errorMessage);
      console.error('Error loading photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const tags = await photoService.getTags();
      setAvailableTags(tags);
    } catch (err) {
      console.error('Error loading tags:', err);
    }
  };

  const handleSelectPhoto = (photo: Photo) => {
    setSelectedPhotos(prev => {
      const isSelected = prev.some(p => p.id === photo.id);
      if (isSelected) {
        return prev.filter(p => p.id !== photo.id);
      }
      return [...prev, photo];
    });
  };

  const handleBulkDelete = async (photoIds: string[]) => {
    try {
      await photoService.bulkDeletePhotos(photoIds);
      setPhotos(prev => prev.filter(photo => !photoIds.includes(photo.id)));
      setSelectedPhotos(prev => prev.filter(photo => !photoIds.includes(photo.id)));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete photos';
      setError(errorMessage);
      console.error('Error deleting photos:', err);
    }
  };

  const handleBulkEdit = async (photoIds: string[]) => {
    // Implement bulk edit functionality
    console.log('Bulk edit photos:', photoIds);
  };

  const handleBulkTag = async (photoIds: string[], tags: string[]) => {
    try {
      await photoService.bulkAddTags(photoIds, tags);
      setPhotos(prev =>
        prev.map(photo => {
          if (photoIds.includes(photo.id)) {
            return { ...photo, tags: [...new Set([...photo.tags, ...tags])] };
          }
          return photo;
        })
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add tags';
      setError(errorMessage);
      console.error('Error adding tags:', err);
    }
  };

  const handleBulkShare = async (photoIds: string[]) => {
    try {
      const shareUrl = await photoService.bulkSharePhotos(photoIds);
      // Implement share functionality
      console.log('Share URL:', shareUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share photos';
      setError(errorMessage);
      console.error('Error sharing photos:', err);
    }
  };

  const handleBulkDownload = async (photoIds: string[]) => {
    try {
      await photoService.bulkDownloadPhotos(photoIds);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download photos';
      setError(errorMessage);
      console.error('Error downloading photos:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Photo Library</Typography>
          {selectedPhotos.length > 0 && (
            <PhotoBulkActions
              selectedPhotos={selectedPhotos}
              onDelete={handleBulkDelete}
              onEdit={handleBulkEdit}
              onTag={handleBulkTag}
              onShare={handleBulkShare}
              onDownload={handleBulkDownload}
              availableTags={availableTags}
            />
          )}
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {photos.map(photo => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
            <Card
              sx={{
                position: 'relative',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              <Checkbox
                checked={selectedPhotos.some(p => p.id === photo.id)}
                onChange={() => handleSelectPhoto(photo)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  zIndex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '50%',
                }}
              />
              <CardMedia
                component="img"
                height="200"
                image={photo.url}
                alt={photo.filename}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="subtitle1" noWrap>
                  {photo.filename}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(photo.uploadedAt).toLocaleDateString()}
                </Typography>
                <Box mt={1}>
                  {photo.tags.map(tag => (
                    <Typography
                      key={tag}
                      variant="caption"
                      sx={{
                        mr: 1,
                        p: 0.5,
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        borderRadius: 1,
                      }}
                    >
                      {tag}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
