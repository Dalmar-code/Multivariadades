/**
 * Utility to compress images in browser before storing in localStorage or state.
 * Reduces image dimensions to max 600px and applies JPEG compression (quality 0.72).
 * Shrinks 3-8MB phone/camera photos down to ~25-45KB to prevent localStorage quota issues.
 */
export const compressImage = (
  dataUrlOrFile: File | string,
  maxWidth = 600,
  quality = 0.72
): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
          } else {
            resolve(typeof dataUrlOrFile === 'string' ? dataUrlOrFile : '');
          }
        } catch {
          resolve(typeof dataUrlOrFile === 'string' ? dataUrlOrFile : '');
        }
      };

      img.onerror = () => {
        resolve(typeof dataUrlOrFile === 'string' ? dataUrlOrFile : '');
      };

      if (typeof dataUrlOrFile === 'string') {
        img.src = dataUrlOrFile;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = (e.target?.result as string) || '';
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(dataUrlOrFile);
      }
    } catch {
      resolve('');
    }
  });
};
