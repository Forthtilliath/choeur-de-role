import { useState } from 'react';

export function useImagePreview(onUpload: (file: File) => Promise<void>) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPendingFile(file);
    e.target.value = '';
  }

  async function confirm() {
    if (!pendingFile) return;
    setUploading(true);
    try {
      await onUpload(pendingFile);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPendingFile(null);
    } catch {
      // onUpload handles its own error toast; preview stays for retry
    } finally {
      setUploading(false);
    }
  }

  function cancel() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
  }

  return { previewUrl, isPending: pendingFile !== null, uploading, handleSelect, confirm, cancel };
}
