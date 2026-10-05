import React, { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { uploadImage, ImageBucket } from '../../services/uploadService';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  bucketName?: ImageBucket;
  folderPath?: string;
  className?: string;
}

const processImage = async (file: File): Promise<Blob> => {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    const MAX_WIDTH = 512;
    const MAX_HEIGHT = 512;
    let width = bitmap.width;
    let height = bitmap.height;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else if (height > MAX_HEIGHT) {
      width *= MAX_HEIGHT / height;
      height = MAX_HEIGHT;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context failed');
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Conversion failed'));
        },
        'image/webp',
        0.85,
      );
    });
  } finally {
    bitmap.close();
  }
};

function renderUploadIcon(uploading: boolean, currentImage?: string) {
  if (uploading) {
    return <Loader2 className="animate-spin text-white/50" size={20} />;
  }
  if (currentImage) {
    return (
      <img
        src={currentImage}
        alt="Uploaded"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    );
  }
  return <Upload size={20} className="text-white/30" />;
}

export default function ImageUploader({
  onImageUploaded,
  currentImage,
  bucketName = 'content',
  folderPath = 'uploads',
  className = '',
}: ImageUploaderProps) {
  // const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const webpBlob = await processImage(file);
      // Server-validated upload (magic bytes checked in backend)
      const publicUrl = await uploadImage(webpBlob, bucketName, folderPath);
      onImageUploaded(publicUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Error al subir imagen. Verifica permisos o consola.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={`image-uploader ${className}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
    >
      <button
        type="button"
        className="uploader-preview"
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '12px',
          background: 'rgba(0,0,0,0.3)',
          border: '1px dashed rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          padding: 0,
        }}
        aria-label={currentImage ? 'Cambiar imagen subida' : 'Subir imagen'}
        onClick={() => fileInputRef.current?.click()}
      >
        {renderUploadIcon(uploading, currentImage)}
      </button>
      <input
        aria-label="Seleccionar archivo de imagen"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <button
        aria-label={currentImage ? 'Cambiar imagen' : 'Subir imagen en formato WebP'}
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="text-left text-xs text-white/50 underline hover:text-white"
      >
        {currentImage ? 'Cambiar Imagen' : 'Subir Imagen (WebP)'}
      </button>
    </div>
  );
}
