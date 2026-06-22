/**
 * Brand colors — the single source of truth for the app's accent palette.
 *
 * Seeded with the website's configured AppearanceConfig values so the UI is
 * correctly branded on first paint. /api/mobile/config also returns a `theme`
 * block; setBrandFromConfig() updates these at runtime if the store changes
 * its colors, without an app release.
 */
export const BRAND = {
  primary: '#8dca78',
  accent: '#6aaa55',
  secondary: '#ffffff',
  onPrimary: '#ffffff',
  /** ~10% primary, for subtle badge/tag backgrounds. */
  tint: '#8dca781a',
};

/** Apply colors from /api/mobile/config's theme block. */
export function setBrandFromConfig(theme?: {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}) {
  if (!theme) return;
  if (theme.primaryColor) {
    BRAND.primary = theme.primaryColor;
    BRAND.tint = theme.primaryColor + '1a';
  }
  if (theme.accentColor) BRAND.accent = theme.accentColor;
  if (theme.secondaryColor) BRAND.secondary = theme.secondaryColor;
}
