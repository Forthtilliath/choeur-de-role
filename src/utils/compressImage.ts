/**
 * Compresse une image côté client via Canvas API et la convertit en WebP.
 * Les fichiers non-image sont retournés sans modification.
 */
export async function compressImage(
  file: File,
  maxWidth = 2400,
  quality = 0.82,
): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas non supporté'));

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression échouée'));
          const name = file.name.replace(/\.[^.]+$/, '.webp');
          resolve(new File([blob], name, { type: 'image/webp' }));
        },
        'image/webp',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Chargement image échoué'));
    };

    img.src = objectUrl;
  });
}
