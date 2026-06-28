import { Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppFonts, Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/lib/i18n';

/**
 * Minimal markdown renderer — mirrors the website's `renderMarkdown`
 * (src/lib/markdown.ts): # ## ### headings, **bold**, *italic*, `code`,
 * "- " lists, and blank-line-separated paragraphs. Renders natively so the
 * content stays theme- and RTL-aware (no WebView / HTML).
 */
export function Markdown({ source }: { source: string }) {
  const { isRTL } = useI18n();
  const align = isRTL ? 'right' : 'left';
  const lines = source.replace(/\r\n/g, '\n').split('\n');

  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length === 0) return;
    const items = list;
    list = [];
    blocks.push(
      <View key={`ul-${key++}`} style={styles.list}>
        {items.map((item, i) => (
          <View key={i} style={[styles.listItem, isRTL && styles.listItemRtl]}>
            <ThemedText themeColor="textSecondary" style={styles.bullet}>
              {'•'}
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={[styles.paragraph, styles.listText, { textAlign: align }]}>
              {renderInline(item)}
            </ThemedText>
          </View>
        ))}
      </View>,
    );
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushList();
      continue;
    }

    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      flushList();
      const level = h[1].length;
      blocks.push(
        <ThemedText
          key={`h-${key++}`}
          style={[level === 1 ? styles.h1 : level === 2 ? styles.h2 : styles.h3, { textAlign: align }]}>
          {renderInline(h[2])}
        </ThemedText>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      list.push(line.replace(/^[-*]\s+/, ''));
      continue;
    }

    flushList();
    blocks.push(
      <ThemedText key={`p-${key++}`} themeColor="textSecondary" style={[styles.paragraph, { textAlign: align }]}>
        {renderInline(line)}
      </ThemedText>,
    );
  }
  flushList();

  return <View>{blocks}</View>;
}

/** Inline spans: **bold**, *italic*, `code`. No nesting (matches the website). */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(<Fragment key={i++}>{text.slice(last, m.index)}</Fragment>);
    const tok = m[0];
    if (tok.startsWith('**')) {
      nodes.push(
        <Text key={i++} style={styles.bold}>
          {tok.slice(2, -2)}
        </Text>,
      );
    } else if (tok.startsWith('`')) {
      nodes.push(
        <Text key={i++} style={styles.codeInline}>
          {tok.slice(1, -1)}
        </Text>,
      );
    } else {
      nodes.push(
        <Text key={i++} style={styles.italic}>
          {tok.slice(1, -1)}
        </Text>,
      );
    }
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push(<Fragment key={i++}>{text.slice(last)}</Fragment>);
  return nodes;
}

const styles = StyleSheet.create({
  h1: { fontFamily: AppFonts.displayBold, fontSize: 24, lineHeight: 30, marginTop: Spacing.three, marginBottom: Spacing.two },
  h2: { fontFamily: AppFonts.display, fontSize: 20, lineHeight: 26, marginTop: Spacing.three, marginBottom: Spacing.one },
  h3: { fontFamily: AppFonts.bodyBold, fontSize: 16, lineHeight: 22, marginTop: Spacing.two, marginBottom: Spacing.one },
  paragraph: { fontSize: 15, lineHeight: 24, marginBottom: Spacing.two },
  list: { marginBottom: Spacing.two, gap: Spacing.one },
  listItem: { flexDirection: 'row', gap: Spacing.two },
  listItemRtl: { flexDirection: 'row-reverse' },
  bullet: { fontSize: 15, lineHeight: 24 },
  listText: { flex: 1, marginBottom: 0 },
  bold: { fontFamily: AppFonts.bodyBold },
  italic: { fontStyle: 'italic' },
  codeInline: { fontFamily: Fonts.mono, fontSize: 13 },
});
