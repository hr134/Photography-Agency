/**
 * Helper to safely resolve image URLs across Next.js and Flask backend.
 */
export function resolveImageUrl(url?: string | null, fallback = '/project_mockup_preview.jpg'): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }

  const trimmed = url.trim();

  // Blob or Data URLs (for instant file previews before upload)
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Absolute URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Uploaded backend files
  if (trimmed.startsWith('/static/')) {
    const backendBase = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') 
      : 'http://localhost:5000';
    return `${backendBase}${trimmed}`;
  }

  // Public folder local assets
  return trimmed;
}
