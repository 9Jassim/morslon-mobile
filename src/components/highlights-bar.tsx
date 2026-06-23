import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoryMedia } from '@/components/story-media';
import { ThemedText } from '@/components/themed-text';
import { AppFonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/lib/cart-store';
import { resolveProductImage } from '@/lib/images';
import { BRAND } from '@/lib/theme-colors';
import type { HomeHighlight } from '@/lib/types';

/** Horizontal "stories" strip + tap-through viewer, mirroring the website's mobile highlights. */
export function HighlightsBar({ highlights }: { highlights: HomeHighlight[] }) {
  const theme = useTheme();
  const [openAt, setOpenAt] = useState<number | null>(null);
  if (highlights.length === 0) return null;

  return (
    <>
      <View style={styles.barWrap}>
        {highlights.map((h, i) => {
          const uri = resolveProductImage(h.thumbnail);
          return (
            <Pressable key={h.id} style={styles.story} onPress={() => setOpenAt(i)}>
              <View style={styles.ring}>
                <View style={[styles.ringInner, { borderColor: theme.background }]}>
                  {uri ? <Image source={{ uri }} style={styles.fill} contentFit="cover" /> : null}
                </View>
              </View>
              <ThemedText type="small" numberOfLines={1} style={styles.storyLabel}>
                {h.titleEn}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {openAt !== null ? (
        <StoryViewer highlights={highlights} startIndex={openAt} onClose={() => setOpenAt(null)} />
      ) : null}
    </>
  );
}

function StoryViewer({
  highlights,
  startIndex,
  onClose,
}: {
  highlights: HomeHighlight[];
  startIndex: number;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addToCart = useCart((s) => s.add);
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [added, setAdded] = useState(false);
  const current = highlights[index];

  const goNext = () => {
    setProgress(0);
    setAdded(false);
    setIndex((i) => (i + 1 >= highlights.length ? -1 : i + 1));
  };
  const goPrev = () => {
    setProgress(0);
    setAdded(false);
    setIndex((i) => Math.max(0, i - 1));
  };

  useEffect(() => {
    if (index < 0) onClose();
  }, [index, onClose]);

  if (!current) return null;

  function onTap(x: number) {
    if (x < 90) goPrev();
    else goNext();
  }

  function onViewMore() {
    const link = current.ctaLink;
    if (!link) return;
    onClose();
    const m = link.match(/\/products\/([^/?#]+)/);
    if (m) router.push({ pathname: '/category/[slug]', params: { slug: m[1] } });
    else if (/^https?:\/\//.test(link)) Linking.openURL(link);
    else router.push(link as never);
  }

  function onAddToCart() {
    if (!current.product) return;
    addToCart(current.product, 1);
    setAdded(true);
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.viewer}>
        <StoryMedia
          key={current.id}
          highlight={current}
          paused={paused}
          onProgress={setProgress}
          onComplete={goNext}
        />
        <View style={styles.scrim} pointerEvents="none" />

        {/* tap zones (hold to pause) — below header/buttons so those stay tappable */}
        <Pressable
          style={styles.tapZone}
          onPressIn={() => setPaused(true)}
          onPressOut={() => setPaused(false)}
          onPress={(e) => onTap(e.nativeEvent.locationX)}
        />

        {/* progress bars */}
        <View style={[styles.progressRow, { top: insets.top + 8 }]}>
          {highlights.map((h, i) => (
            <View key={h.id} style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%' },
                ]}
              />
            </View>
          ))}
        </View>

        <View style={[styles.viewerHeader, { top: insets.top + 20 }]}>
          <ThemedText style={styles.viewerTitle}>{current.titleEn}</ThemedText>
          <Pressable hitSlop={10} onPress={onClose}>
            <Ionicons name="close" size={26} color="#fff" />
          </Pressable>
        </View>

        {(current.product || current.ctaLink) ? (
          <View style={[styles.ctaRow, { bottom: insets.bottom + 24 }]}>
            {current.ctaLink ? (
              <Pressable style={[styles.cta, styles.ctaOutline]} onPress={onViewMore}>
                <ThemedText style={styles.ctaOutlineText}>View more</ThemedText>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </Pressable>
            ) : null}
            {current.product ? (
              <Pressable
                style={[styles.cta, styles.ctaFilled, added && styles.ctaAdded]}
                onPress={onAddToCart}
                disabled={added || current.product.stock <= 0}>
                <Ionicons name={added ? 'checkmark' : 'bag-add'} size={16} color="#fff" />
                <ThemedText style={styles.ctaText}>
                  {added ? 'Added' : current.product.stock <= 0 ? 'Sold out' : 'Add to cart'}
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const RING = 64;
const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  barWrap: { flexDirection: 'row', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingTop: Spacing.two },
  story: { alignItems: 'center', gap: Spacing.one, width: RING + 8 },
  ring: {
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    padding: 2.5,
    backgroundColor: BRAND.accent,
  },
  ringInner: { flex: 1, borderRadius: RING / 2, overflow: 'hidden', borderWidth: 2 },
  storyLabel: { textAlign: 'center', fontSize: 11 },

  viewer: { flex: 1, backgroundColor: '#000' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.25)' },
  progressRow: { position: 'absolute', left: Spacing.three, right: Spacing.three, flexDirection: 'row', gap: 4 },
  progressTrack: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff' },
  viewerHeader: { position: 'absolute', left: Spacing.three, right: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  viewerTitle: { fontFamily: AppFonts.displayBold, fontSize: 18, color: '#fff' },
  tapZone: { ...StyleSheet.absoluteFill },
  ctaRow: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: 12,
    borderRadius: 999,
  },
  ctaFilled: { backgroundColor: BRAND.accent, flex: 1 },
  ctaAdded: { backgroundColor: '#1a7f37' },
  ctaOutline: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.85)', flex: 1 },
  ctaOutlineText: { fontFamily: AppFonts.bodyBold, fontSize: 14, color: '#fff' },
  ctaText: { fontFamily: AppFonts.bodyBold, fontSize: 14, color: '#fff' },
});
