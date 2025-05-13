'use client'

import { useState } from 'react';
import ImageCompression from 'browser-image-compression';

export const useImageUpload = (initialPreview: string | null) => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(initialPreview);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) return;

    const compressedFile = await compressImage(selectedFile);

    if (compressedFile && compressedFile.size <= 1 * 1024 * 1024) {
      setFile(compressedFile);
      setFilePreview(URL.createObjectURL(compressedFile));
    } else {
      alert('Compressed image exceeds 1MB');
      setFile(null);
      setFilePreview(null);
    }
  };

  const compressImage = async (image: File): Promise<File | null> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    };

    try {
      const compressedFile = await ImageCompression(image, options);
      return compressedFile as File; // Type assertion to specify it's a File
    } catch (error) {
      console.error('Image compression failed:', error);
      alert('Image compression failed.');
      return null;
    }
  };

  return {
    file,
    filePreview,
    setFilePreview,
    handleFileChange,
  };
};
