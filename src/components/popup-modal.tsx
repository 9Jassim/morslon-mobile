import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { AppFonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { HomePopup } from '@/lib/types';

const TYPE_COLOR: Record<string, string> = {
  info: '#2f6fed',
  success: '#1a7f37',
  warning: '#c77700',
  alert: '#d93025',
};

/** Shows the first active popup once per app session. */
export function PopupModal({ popups }: { popups: HomePopup[] }) {
  const theme = useTheme();
  const router = useRouter();
  const popup = popups[0];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (popup) setVisible(true);
  }, [popup?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!popup) return null;
  const accent = TYPE_COLOR[popup.type] ?? TYPE_COLOR.info;

  function onCta() {
    setVisible(false);
    const link = popup.ctaLink;
    if (!link) return;
    const m = link.match(/\/products\/([^/?#]+)/);
    if (m) router.push({ pathname: '/category/[slug]', params: { slug: m[1] } });
    else if (/^https?:\/\//.test(link)) Linking.openURL(link);
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={[styles.iconWrap, { backgroundColor: accent + '1a' }]}>
            <Ionicons name="megaphone-outline" size={26} color={accent} />
          </View>
          <ThemedText type="subtitle" style={styles.title}>
            {popup.titleEn}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.message}>
            {popup.messageEn}
          </ThemedText>
          <Button
            title={popup.ctaTextEn || 'Got it'}
            onPress={popup.ctaLink ? onCta : () => setVisible(false)}
            style={styles.cta}
          />
          {popup.dismissable ? (
            <Pressable onPress={() => setVisible(false)} hitSlop={8} style={styles.dismiss}>
              <ThemedText type="small" themeColor="textSecondary">
                Dismiss
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.one },
  title: { textAlign: 'center' },
  message: { textAlign: 'center', lineHeight: 21 },
  cta: { alignSelf: 'stretch', marginTop: Spacing.two },
  dismiss: { paddingVertical: Spacing.two },
});
