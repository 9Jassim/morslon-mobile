/**
 * Resolve a product image filename to a displayable URL.
 * Mirrors the website's resolveProductImage (NEXT_PUBLIC_IMAGES_URL).
 * Set EXPO_PUBLIC_IMAGES_URL to the same S3 base.
 */
const IMAGES_BASE = (process.env.EXPO_PUBLIC_IMAGES_URL ?? "").replace(/\/$/, "");

export function resolveProductImage(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return IMAGES_BASE ? `${IMAGES_BASE}/${src}` : null;
}

/** First usable image from a product's images array, or null. */
export function productThumbnail(images: string[] | undefined): string | null {
  return resolveProductImage(images?.[0]);
}
