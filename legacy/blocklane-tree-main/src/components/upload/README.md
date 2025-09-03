# PhotoDropzone Component

A reusable React component for uploading photos with drag-and-drop functionality, built for Supabase Storage integration.

## Features

- ✅ Click to upload or drag-and-drop files
- ✅ Real-time file validation (type, size, max files)
- ✅ Progress indicators during upload
- ✅ Thumbnail previews with remove functionality
- ✅ Keyboard accessible
- ✅ Mobile responsive
- ✅ Supabase Storage integration
- ✅ Dutch localization

## Props

```typescript
interface PhotoDropzoneProps {
  bucket?: string;              // Supabase storage bucket (default: "ticket-photos")
  pathPrefix?: string;          // Storage path prefix (e.g., "tickets/{ticketId}/photos")
  maxFiles?: number;            // Maximum number of files (default: 8)
  maxSizeMB?: number;           // Maximum file size in MB (default: 10)
  acceptedMimeTypes?: string[]; // Accepted file types (default: image formats)
  value?: UploadedPhoto[];      // Current uploaded photos
  onChange?: (files: UploadedPhoto[]) => void; // Callback when photos change
  showHelpText?: boolean;       // Show help text (default: true)
}

type UploadedPhoto = {
  id: string;
  url: string;
  name: string;
  size: number;
  mime: string;
  publicUrl: string;
}
```

## Usage

```tsx
import { PhotoDropzone, type UploadedPhoto } from '@/components/upload/PhotoDropzone';

function MyComponent() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  return (
    <PhotoDropzone
      bucket="my-bucket"
      pathPrefix="user/photos"
      maxFiles={5}
      maxSizeMB={8}
      value={photos}
      onChange={setPhotos}
    />
  );
}
```

## Validation

- **File types**: JPG, PNG, WEBP, HEIC, HEIF
- **File size**: Configurable max size per file (default 10MB)
- **File count**: Configurable max number of files (default 8)

## Accessibility

- Full keyboard navigation support
- Screen reader compatible
- ARIA labels and live regions for error announcements
- Focus management for interactive elements

## Storage Integration

The component automatically:
- Generates unique UUIDs for filenames
- Uploads files to specified Supabase Storage bucket
- Manages public URLs for thumbnails
- Handles file deletion from storage when removed

## Error Handling

- Type validation with user-friendly error messages
- Size validation with clear feedback
- Upload failure handling with retry options
- Network error recovery