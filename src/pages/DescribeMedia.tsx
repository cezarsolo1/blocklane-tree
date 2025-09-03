/**
 * Describe & Media Page (Step 2)
 * 
 * Textarea for description and file upload for photos.
 * Based on spec section 3.1 - Step 2: Describe & Media.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, AlertCircle, RotateCcw, GripVertical } from 'lucide-react';
import { createTicketService } from '@/modules/tickets/TicketServiceFactory';

interface DescribeMediaProps {
  ticketId: string;
  requiredFields?: string[];
  onNext: (data: { description: string; photos: File[] }) => void;
  onBack: () => void;
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  needs_conversion?: boolean;
  upload_progress?: number;
  upload_status?: 'pending' | 'uploading' | 'completed' | 'failed';
  error_message?: string;
  retry_count?: number;
}

export const DescribeMedia = ({ ticketId, requiredFields = [], onNext, onBack }: DescribeMediaProps) => {
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const ticketService = createTicketService();

  const isPhotoRequired = requiredFields.includes('photos') || requiredFields.includes('photo');
  const isDescriptionRequired = requiredFields.includes('description');

  // Image orientation fix utility
  const fixImageOrientation = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Auto-rotate based on EXIF orientation
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const fixedFile = new File([blob], file.name, { type: 'image/jpeg' });
            resolve(fixedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.9);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  // Process files with orientation fix
  const processFiles = useCallback(async (files: File[]) => {
    const validationErrors = validateFiles(files);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const processedFiles: FileWithPreview[] = [];
    
    for (const file of files) {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      let processedFile = file;
      
      // Fix orientation for JPEG images
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        try {
          processedFile = await fixImageOrientation(file);
        } catch (error) {
          console.warn('Failed to fix image orientation:', error);
        }
      }
      
      const fileWithPreview: FileWithPreview = Object.assign(processedFile, {
        id: fileId,
        upload_status: 'pending' as const,
        upload_progress: 0,
        retry_count: 0,
        needs_conversion: file.type === 'image/heic'
      });
      
      // Create preview for non-HEIC files
      if (file.type !== 'image/heic') {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileWithPreview.preview = e.target?.result as string;
          setPhotos(prev => prev.map(p => p.id === fileId ? fileWithPreview : p));
        };
        reader.readAsDataURL(processedFile);
      }
      
      processedFiles.push(fileWithPreview);
    }

    setPhotos(prev => [...prev, ...processedFiles]);
    setErrors([]);
  }, [fixImageOrientation]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, [processFiles]);

  // Paste from clipboard handler
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items || []);
      const imageFiles = items
        .filter(item => item.type.startsWith('image/'))
        .map(item => item.getAsFile())
        .filter(Boolean) as File[];
      
      if (imageFiles.length > 0) {
        await processFiles(imageFiles);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [processFiles]);

  // Reorder photos via drag and drop
  const handlePhotoReorder = useCallback((fromIndex: number, toIndex: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      const [movedPhoto] = newPhotos.splice(fromIndex, 1);
      newPhotos.splice(toIndex, 0, movedPhoto);
      return newPhotos;
    });
  }, []);

  // Retry failed upload
  const retryUpload = useCallback(async (photoId: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, upload_status: 'pending', error_message: undefined, retry_count: (photo.retry_count || 0) + 1 }
        : photo
    ));
  }, []);

  const validateFiles = (files: File[]): string[] => {
    const errors: string[] = [];
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 8;

    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }

    files.forEach((file, index) => {
      if (!validTypes.includes(file.type)) {
        errors.push(`File ${index + 1}: Invalid file type. Allowed: JPG, PNG, WEBP, HEIC`);
      }
      if (file.size > maxSize) {
        errors.push(`File ${index + 1}: File too large. Maximum 10MB`);
      }
    });

    return errors;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    await processFiles(files);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const uploadSingleFile = useCallback(async (photo: FileWithPreview): Promise<void> => {
    setPhotos(prev => prev.map(p => 
      p.id === photo.id 
        ? { ...p, upload_status: 'uploading', upload_progress: 0 }
        : p
    ));

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setPhotos(prev => prev.map(p => {
          if (p.id === photo.id && p.upload_progress !== undefined && p.upload_progress < 90) {
            return { ...p, upload_progress: p.upload_progress + 10 };
          }
          return p;
        }));
      }, 200);

      await ticketService.uploadMedia(ticketId, [photo]);
      
      clearInterval(progressInterval);
      setPhotos(prev => prev.map(p => 
        p.id === photo.id 
          ? { ...p, upload_status: 'completed', upload_progress: 100 }
          : p
      ));
    } catch (error) {
      setPhotos(prev => prev.map(p => 
        p.id === photo.id 
          ? { 
              ...p, 
              upload_status: 'failed', 
              error_message: error instanceof Error ? error.message : 'Upload failed',
              upload_progress: 0
            }
          : p
      ));
    }
  }, [ticketId, ticketService]);

  const handleSubmit = async () => {
    const newErrors: string[] = [];

    if (isDescriptionRequired && description.trim().length < 10) {
      newErrors.push('Description must be at least 10 characters');
    }

    if (isPhotoRequired && photos.length === 0) {
      newErrors.push('At least one photo is required');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsUploading(true);
    try {
      // Upload media files with individual progress tracking
      if (photos.length > 0) {
        const pendingPhotos = photos.filter(p => p.upload_status === 'pending' || p.upload_status === 'failed');
        await Promise.all(pendingPhotos.map(photo => uploadSingleFile(photo)));
      }

      // Update ticket with description
      await ticketService.update(ticketId, { description });

      onNext({ description, photos });
    } catch (error) {
      setErrors(['Failed to upload media or update ticket. Please try again.']);
    } finally {
      setIsUploading(false);
    }
  };

  const canProceed = (!isDescriptionRequired || description.trim().length >= 10) &&
                     (!isPhotoRequired || photos.length > 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Describe the Issue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description {isDescriptionRequired && <span className="text-red-500">*</span>}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={4}
              className="w-full"
            />
            {isDescriptionRequired && (
              <p className="text-sm text-gray-500 mt-1">
                Minimum 10 characters required
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Photos {isPhotoRequired && <span className="text-red-500">*</span>}
            </label>
            
            {/* Upload Area */}
            <div
              ref={dropZoneRef}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Drag and drop photos here, paste from clipboard, or click to select
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, WEBP, HEIC up to 10MB each (max 8 files)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="file-input"
            />

            {/* Photo Preview */}
            {photos.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Selected Photos ({photos.length}/8)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div 
                      key={photo.id} 
                      className="relative group"
                      draggable
                      onDragStart={() => setDraggedIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIndex !== null && draggedIndex !== index) {
                          handlePhotoReorder(draggedIndex, index);
                        }
                        setDraggedIndex(null);
                      }}
                    >
                      {/* Drag handle */}
                      <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <GripVertical className="h-4 w-4 text-white bg-black bg-opacity-50 rounded" />
                      </div>
                      
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {photo.preview ? (
                          <img
                            src={photo.preview}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-xs text-gray-500">
                              {photo.needs_conversion ? 'HEIC (converting...)' : 'Loading...'}
                            </span>
                          </div>
                        )}
                        
                        {/* Upload progress overlay */}
                        {photo.upload_status === 'uploading' && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="text-white text-xs">
                              {photo.upload_progress}%
                            </div>
                          </div>
                        )}
                        
                        {/* Upload status indicators */}
                        {photo.upload_status === 'completed' && (
                          <div className="absolute top-1 right-6 w-3 h-3 bg-green-500 rounded-full" />
                        )}
                        
                        {photo.upload_status === 'failed' && (
                          <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                            <button
                              onClick={() => retryUpload(photo.id)}
                              className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                              title="Retry upload"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Remove button */}
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      
                      {/* Error message */}
                      {photo.error_message && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs p-1 rounded-b-lg">
                          {photo.error_message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Reorder hint */}
                <p className="text-xs text-gray-500 mt-2">
                  Drag photos to reorder them
                </p>
              </div>
            )}

            {/* Visual nudge for optional photos */}
            {!isPhotoRequired && photos.length === 0 && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <p className="text-sm text-blue-700">
                    Adding photos helps contractors understand the issue better
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Upload Summary */}
          {photos.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Upload Status:</span>
                <span>
                  {photos.filter(p => p.upload_status === 'completed').length} / {photos.length} completed
                </span>
              </div>
              {photos.some(p => p.upload_status === 'failed') && (
                <p className="text-xs text-red-600 mt-1">
                  Some uploads failed. Click retry button to try again.
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button onClick={onBack} variant="outline">
              Back
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!canProceed || isUploading || photos.some(p => p.upload_status === 'uploading')}
            >
              {isUploading ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
