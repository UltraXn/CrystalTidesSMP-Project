import { useState, useRef } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../../services/supabaseClient';
import { uploadImage as uploadImageSecure } from '../../../services/uploadService';
import { newsFormSchema, type NewsFormValues } from '@crystaltides/shared';

function canvasToWebpBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Conversion failed'));
      },
      'image/webp',
      0.8,
    );
  });
}

function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const convertFileToWebP = async (file: File): Promise<Blob> => {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await loadImageFromDataUrl(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No canvas context');
  }
  ctx.drawImage(img, 0, 0);
  return canvasToWebpBlob(canvas);
};

export function useNewsForm(initialData?: NewsFormValues) {
  const { t } = useTranslation();
  const contentFileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema) as Resolver<NewsFormValues>,
    defaultValues: initialData || {
      title: '',
      title_en: '',
      category: 'General',
      content: '',
      content_en: '',
      status: 'Draft',
      image: '',
    },
  });

  const { setValue, watch } = form;

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      setUploadError(null);

      const webpBlob = await convertFileToWebP(file);
      return await uploadImageSecure(webpBlob, 'forum-uploads', 'news');
    } catch (error: unknown) {
      console.error('Error uploading image:', error);
      setUploadError((error as Error).message || t('admin.news.upload_error_unknown'));
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const url = await uploadImage(file);
    if (url) {
      setValue('image', url, { shouldValidate: true });
    }
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const url = await uploadImage(file);
    if (url) {
      const currentContent = watch('content') || '';
      const imageMarkdown = `\n![Imagen](${url})\n`;
      setValue('content', currentContent + imageMarkdown, { shouldValidate: true });
    }
    if (contentFileInputRef.current) contentFileInputRef.current.value = '';
  };

  const handleTranslate = async (
    text: string,
    toLang: 'es' | 'en',
    field: 'title' | 'content' | 'title_en' | 'content_en',
  ) => {
    if (!text) return;
    setTranslating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${API_URL}/translation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, targetLang: toLang }),
      });
      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      if (data.success) {
        setValue(field, data.translatedText, { shouldValidate: true });
      }
    } catch (error) {
      console.error('Translation fail', error);
    } finally {
      setTranslating(false);
    }
  };

  return {
    t,
    form,
    contentFileInputRef,
    uploading,
    uploadError,
    translating,
    handleImageUpload,
    handleContentImageUpload,
    handleTranslate,
  };
}
