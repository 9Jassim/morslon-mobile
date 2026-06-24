import { StyleSheet, Text, type TextProps } from 'react-native';

import { AppFonts, Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/lib/i18n';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const { isRTL } = useI18n();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'], writingDirection: isRTL ? 'rtl' : 'ltr' },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // Display — characterful serif
  title: {
    fontFamily: AppFonts.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: AppFonts.display,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  // Body — Manrope
  default: {
    fontFamily: AppFonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  small: {
    fontFamily: AppFonts.body,
    fontSize: 13,
    lineHeight: 19,
  },
  smallBold: {
    fontFamily: AppFonts.bodyBold,
    fontSize: 13,
    lineHeight: 19,
  },
  link: {
    fontFamily: AppFonts.bodySemibold,
    fontSize: 14,
    lineHeight: 28,
  },
  linkPrimary: {
    fontFamily: AppFonts.bodySemibold,
    fontSize: 14,
    lineHeight: 28,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
});
