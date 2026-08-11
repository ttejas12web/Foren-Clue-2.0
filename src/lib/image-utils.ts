/**
 * Utility to compress images on the client side before upload
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<Blob> {
  return new Promise((resolve) => {
    if (!file || !(file instanceof Blob) || !file.type.startsWith('image/')) {
      return resolve(file);
    }

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        try {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;

              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              if (!ctx) {
                console.warn('Canvas context unavailable for image compression, returning raw file');
                return resolve(file);
              }

              ctx.drawImage(img, 0, 0, width, height);

              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    resolve(blob);
                  } else {
                    console.warn('Canvas toBlob returned null, returning raw file');
                    resolve(file);
                  }
                },
                'image/jpeg',
                quality
              );
            } catch (err) {
              console.warn('Canvas compression error, returning raw file:', err);
              resolve(file);
            }
          };
          img.onerror = (err) => {
            console.warn('Image element failed to load data URL, returning raw file:', err);
            resolve(file);
          };
        } catch (err) {
          console.warn('FileReader onload handler error, returning raw file:', err);
          resolve(file);
        }
      };
      reader.onerror = (err) => {
        console.warn('FileReader failed to read image file, returning raw file:', err);
        resolve(file);
      };
    } catch (err) {
      console.warn('compressImage exception, returning raw file:', err);
      resolve(file);
    }
  });
}
