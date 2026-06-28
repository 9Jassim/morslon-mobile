import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { resolveProductImage } from '@/lib/images';
import type { HomePopupBanner } from '@/lib/types';

// Remembered for the app session so it shows once per launch.
let dismissedId: string | null = null;

/** Full-screen image promo popup shown shortly after the home screen loads. */
export function PopupBanner({ banner }: { banner: HomePopupBanner | null }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!banner || dismissedId === banner.id) return;
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, [banner?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!banner) return null;
  const uri = resolveProductImage(banner.image);

  function dismiss() {
    dismissedId = banner!.id;
    setVisible(false);
  }

  function onPress() {
    const link = banner!.link;
    dismiss();
    if (!link) return;
    const m = link.match(/\/products\/([^/?#]+)/);
    if (m) router.push({ pathname: '/category/[slug]', params: { slug: m[1] } });
    else if (/^https?:\/\//.test(link)) Linking.openURL(link).catch(() => {});
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={dismiss}>
      <Pressable style={styles.backdrop} onPress={dismiss}>
        <View style={styles.card}>
          <Pressable onPress={onPress}>
            {uri ? <Image source={{ uri }} style={styles.image} contentFit="contain" transition={150} /> : null}
          </Pressable>
          <Pressable style={styles.close} hitSlop={10} onPress={dismiss}>
            <Ionicons name="close" size={20} color="#fff" />
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  card: { width: '100%', maxWidth: 460, alignItems: 'center' },
  image: { width: '100%', aspectRatio: 0.8, borderRadius: Radius.lg },
  close: {
    position: 'absolute',
    top: -14,
    right: -6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
