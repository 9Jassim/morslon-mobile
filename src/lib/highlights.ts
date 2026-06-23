/** Extract an 11-char YouTube video id from any YouTube URL, or null. */
export function getYouTubeId(raw: string): string | null {
  const m = (raw ?? '').match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

/** Normalise a YouTube / Instagram URL into an embeddable player src (mirrors the website). */
export function toEmbedUrl(raw: string): string {
  const url = (raw ?? '').trim();
  if (!url) return url;

  const yt = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([\w-]{11})/,
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&playsinline=1&autoplay=1&mute=1`;

  const ig = url.match(/instagram\.com\/(reel|p|tv)\/([\w-]+)/);
  if (ig) return `https://www.instagram.com/${ig[1]}/${ig[2]}/embed/`;

  return url;
}
