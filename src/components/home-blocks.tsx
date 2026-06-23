import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { ProductCard } from '@/components/product-grid';
import { ThemedText } from '@/components/themed-text';
import { AppFonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { resolveProductImage } from '@/lib/images';
import { BRAND } from '@/lib/theme-colors';
import type { HomeCategory, HomeProduct } from '@/lib/types';

const SCREEN = Dimensions.get('window').width;
const PAD = Spacing.three;
const CONTENT_W = SCREEN - PAD * 2;

const ITEM_W = Math.round(SCREEN * 0.78);
const ITEM_GAP = Spacing.three;
const SNAP = ITEM_W + ITEM_GAP;
const SIDE_PAD = (SCREEN - ITEM_W) / 2;

// Two cards fully visible + a peek of the next, signalling there's more to scroll.
const RAIL_PEEK = 34;
const RAIL_CARD_W = Math.floor((CONTENT_W - ITEM_GAP - RAIL_PEEK) / 2);
const ROTATE_MS = 4500;

const AnimatedFlatList = Animated.FlatList;

export type Slide = { id: string; image: string; link?: string | null; titleEn?: string; subtitleEn?: string | null };

/** Best-effort: turn a website link into an in-app category route. */
function useLinkPress() {
  const router = useRouter();
  return (link?: string | null) => {
    if (!link) return;
    const m = link.match(/\/products\/([^/?#]+)/);
    if (m) router.push({ pathname: '/category/[slug]', params: { slug: m[1] } });
  };
}

function SectionTitle({ children }: { children: string }) {
  return (
    <View style={styles.titleRow}>
      <View style={styles.titleBar} />
      <ThemedText type="subtitle">{children}</ThemedText>
    </View>
  );
}

/* ── Infinite, centered, auto-rotating banner carousel ────────────── */
function CarouselCard({
  slide,
  index,
  scrollX,
  onPress,
}: {
  slide: Slide;
  index: number;
  scrollX: SharedValue<number>;
  onPress: () => void;
}) {
  const uri = resolveProductImage(slide.image);
  const animStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * SNAP, index * SNAP, (index + 1) * SNAP];
    const scale = interpolate(scrollX.value, input, [0.88, 1, 0.88], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, input, [0.5, 1, 0.5], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity };
  });

  return (
    <Animated.View style={[{ width: ITEM_W, marginRight: ITEM_GAP }, animStyle]}>
      <Pressable style={styles.spotCard} onPress={onPress}>
        {uri ? <Image source={{ uri }} style={styles.fill} contentFit="cover" transition={200} /> : null}
        {slide.titleEn ? (
          <View style={styles.spotOverlay}>
            <ThemedText style={styles.spotTitle}>{slide.titleEn}</ThemedText>
            {slide.subtitleEn ? <ThemedText style={styles.spotSubtitle}>{slide.subtitleEn}</ThemedText> : null}
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export function BannerCarousel({ title, slides }: { title?: string; slides: Slide[] }) {
  const onLink = useLinkPress();
  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useSharedValue(0);
  const [active, setActive] = useState(0);

  const many = slides.length > 1;
  const loop = many ? [...slides, ...slides, ...slides] : slides;
  const start = many ? slides.length : 0;
  const indexRef = useRef(start);
  const pausedRef = useRef(false);

  // Position on the middle copy at mount.
  useEffect(() => {
    if (many) {
      const t = setTimeout(() => listRef.current?.scrollToOffset({ offset: start * SNAP, animated: false }), 0);
      return () => clearTimeout(t);
    }
  }, [many, start]);

  // Auto-rotate; pauses while the user is holding/dragging.
  useEffect(() => {
    if (!many) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const next = indexRef.current + 1;
      indexRef.current = next;
      setActive(((next % slides.length) + slides.length) % slides.length);
      listRef.current?.scrollToOffset({ offset: next * SNAP, animated: true });
      if (next >= slides.length * 2) {
        setTimeout(() => {
          const rec = (next % slides.length) + slides.length;
          indexRef.current = rec;
          listRef.current?.scrollToOffset({ offset: rec * SNAP, animated: false });
        }, 500);
      }
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [many, slides.length]);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  if (slides.length === 0) return null;

  return (
    <View style={title ? styles.section : styles.spotWrap}>
      {title ? <SectionTitle>{title}</SectionTitle> : null}
      <AnimatedFlatList
        ref={listRef as never}
        data={loop}
        keyExtractor={(_, i) => String(i)}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: SIDE_PAD }}
        getItemLayout={(_, i) => ({ length: SNAP, offset: SNAP * i, index: i })}
        onTouchStart={() => (pausedRef.current = true)}
        onScrollBeginDrag={() => (pausedRef.current = true)}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SNAP);
          indexRef.current = idx;
          setActive(((idx % slides.length) + slides.length) % slides.length);
          if (many && (idx < slides.length || idx >= slides.length * 2)) {
            const norm = (idx % slides.length) + slides.length;
            indexRef.current = norm;
            listRef.current?.scrollToOffset({ offset: norm * SNAP, animated: false });
          }
          pausedRef.current = false;
        }}
        renderItem={({ item, index }) => (
          <CarouselCard slide={item as Slide} index={index} scrollX={scrollX} onPress={() => onLink((item as Slide).link)} />
        )}
      />
      {many ? (
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View key={s.id} style={[styles.dot, i === active ? styles.dotActive : null]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/* ── Category quick-nav strip ─────────────────────────────────────── */
export function CategoryStrip({ categories }: { categories: HomeCategory[] }) {
  const router = useRouter();
  const theme = useTheme();
  if (categories.length === 0) return null;
  return (
    <FlatList
      data={categories}
      keyExtractor={(c) => c.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.stripList}
      style={styles.strip}
      renderItem={({ item }) => {
        const uri = resolveProductImage(item.image);
        return (
          <Pressable
            style={styles.chip}
            onPress={() => router.push({ pathname: '/category/[slug]', params: { slug: item.slug } })}>
            <View style={[styles.chipCircle, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              {uri ? (
                <Image source={{ uri }} style={styles.fill} contentFit="cover" />
              ) : (
                <ThemedText style={styles.chipInitial}>{item.nameEn.charAt(0)}</ThemedText>
              )}
            </View>
            <ThemedText type="small" numberOfLines={1} style={styles.chipLabel}>
              {item.nameEn}
            </ThemedText>
          </Pressable>
        );
      }}
    />
  );
}

/* ── Full-width banner (mid / category position) ──────────────────── */
export function FullBanner({ banner }: { banner: Slide }) {
  const onLink = useLinkPress();
  const uri = resolveProductImage(banner.image);
  if (!uri) return null;
  return (
    <Pressable style={styles.fullBanner} onPress={() => onLink(banner.link)}>
      <Image source={{ uri }} style={styles.fill} contentFit="cover" transition={200} />
      {banner.titleEn ? (
        <View style={styles.spotOverlay}>
          <ThemedText style={styles.spotTitle}>{banner.titleEn}</ThemedText>
          {banner.subtitleEn ? <ThemedText style={styles.spotSubtitle}>{banner.subtitleEn}</ThemedText> : null}
        </View>
      ) : null}
    </Pressable>
  );
}

/* ── Horizontal product rail (two at a time) ──────────────────────── */
export function ProductRail({
  title,
  products,
  seeAllSlug,
}: {
  title?: string;
  products: HomeProduct[];
  seeAllSlug?: string;
}) {
  const router = useRouter();
  if (products.length === 0) return null;
  return (
    <View style={styles.section}>
      {title ? (
        <View style={styles.railHead}>
          <View style={styles.titleInner}>
            <View style={styles.titleBar} />
            <ThemedText type="subtitle">{title}</ThemedText>
          </View>
          {seeAllSlug ? (
            <Pressable
              onPress={() => router.push({ pathname: '/category/[slug]', params: { slug: seeAllSlug } })}
              hitSlop={8}>
              <ThemedText style={styles.seeAll}>View all ›</ThemedText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={RAIL_CARD_W + ITEM_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.railList}
        renderItem={({ item, index }) => <ProductCard product={item} index={index} width={RAIL_CARD_W} />}
      />
    </View>
  );
}

/* ── Poster grid (2-up images) ────────────────────────────────────── */
export function PosterGrid({ title, items }: { title?: string; items: { image?: string; link?: string }[] }) {
  const onLink = useLinkPress();
  const usable = items.filter((it) => it.image);
  if (usable.length === 0) return null;
  return (
    <View style={styles.section}>
      {title ? <SectionTitle>{title}</SectionTitle> : null}
      <View style={styles.posterWrap}>
        {usable.map((it, i) => {
          const uri = resolveProductImage(it.image);
          return (
            <Pressable key={i} style={styles.poster} onPress={() => onLink(it.link)}>
              {uri ? <Image source={{ uri }} style={styles.fill} contentFit="cover" transition={200} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  section: { gap: Spacing.three, marginTop: Spacing.five },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: PAD },
  titleInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  titleBar: { width: 4, height: 20, borderRadius: 2, backgroundColor: BRAND.accent },
  railHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: PAD },
  seeAll: { fontFamily: AppFonts.bodySemibold, fontSize: 13, color: BRAND.accent },
  fullBanner: {
    marginHorizontal: PAD,
    marginTop: Spacing.four,
    aspectRatio: 16 / 6,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: '#0001',
  },

  spotWrap: { marginTop: Spacing.three },
  spotCard: { width: ITEM_W, aspectRatio: 16 / 10, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: '#0002' },
  spotOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: Spacing.three, backgroundColor: 'rgba(0,0,0,0.3)' },
  spotTitle: { fontFamily: AppFonts.displayBold, fontSize: 20, color: '#fff' },
  spotSubtitle: { fontFamily: AppFonts.body, fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.three },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0003' },
  dotActive: { backgroundColor: BRAND.accent, width: 18 },

  strip: { marginTop: Spacing.four },
  stripList: { paddingHorizontal: PAD, gap: Spacing.three },
  chip: { alignItems: 'center', gap: Spacing.one, width: 68 },
  chipCircle: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  chipInitial: { fontFamily: AppFonts.displayBold, fontSize: 22, color: BRAND.accent },
  chipLabel: { textAlign: 'center' },

  railList: { paddingHorizontal: PAD, gap: ITEM_GAP },

  posterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, paddingHorizontal: PAD },
  poster: { width: (CONTENT_W - Spacing.two) / 2, aspectRatio: 1, borderRadius: Radius.md, overflow: 'hidden', backgroundColor: '#0001' },
});
