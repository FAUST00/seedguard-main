/**
 * Client-side avatar processing — resizes/crops an uploaded photo to a
 * square JPEG data URI and stores it directly in profiles.avatar_url.
 * No Supabase Storage bucket required, so this works today with zero
 * manual setup. (Future upgrade path: move to a real Storage bucket for
 * smaller database rows and CDN-served images — not required to ship this.)
 */

const MAX_DIMENSION = 160;
const JPEG_QUALITY = 0.78;

export function resizeImageToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not load that image.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = MAX_DIMENSION;
        canvas.height = MAX_DIMENSION;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Image processing is not supported in this browser.')); return; }
        const scale = Math.max(MAX_DIMENSION / img.width, MAX_DIMENSION / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (MAX_DIMENSION - w) / 2, (MAX_DIMENSION - h) / 2, w, h);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
