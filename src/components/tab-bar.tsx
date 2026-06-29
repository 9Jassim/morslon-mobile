import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { AppFonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/lib/cart-store';
import { useI18n } from '@/lib/i18n';
import { BRAND } from '@/lib/theme-colors';
import { useWishlist } from '@/lib/wishlist-store';

type IconName = keyof typeof Ionicons.glyphMap;

type TabDef = {
  key: 'home' | 'categories' | 'cart' | 'wishlist' | 'account';
  href: Href;
  icons?: [IconName, IconName];
  label?: 'tabs.home' | 'tabs.categories' | 'tabs.wishlist' | 'tabs.account';
  fab?: boolean;
  badge?: 'wishlist';
  /** Path prefixes that should keep this tab highlighted. */
  match: (p: string) => boolean;
};

const TABS: TabDef[] = [
  { key: 'home', href: '/', icons: ['home-outline', 'home'], label: 'tabs.home', match: (p) => p === '/' },
  { key: 'categories', href: '/categories', icons: ['grid-outline', 'grid'], label: 'tabs.categories', match: (p) => p.startsWith('/categories') || p.startsWith('/category') },
  { key: 'cart', href: '/cart', fab: true, match: (p) => p.startsWith('/cart') },
  { key: 'wishlist', href: '/wishlist', icons: ['heart-outline', 'heart'], label: 'tabs.wishlist', badge: 'wishlist', match: (p) => p.startsWith('/wishlist') },
  {
    key: 'account',
    href: '/account',
    icons: ['person-outline', 'person'],
    label: 'tabs.account',
    match: (p) => ['/account', '/profile', '/orders', '/wallet', '/loyalty', '/pages'].some((r) => p.startsWith(r)),
  },
];

/** Global floating bottom bar — rendered once at the root so it shows on every screen. */
export function BottomBar() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const wishlistCount = useWishlist((s) => s.ids.size);

  // Hide on focused buying flows that have their own bottom CTA.
  if (pathname.startsWith('/product')) return null;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: insets.bottom + 10 }]}>
      <View style={[styles.bar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {TABS.map((tab) => {
          const focused = tab.match(pathname);
          const go = () => router.navigate(tab.href);
          if (tab.fab) return <CartFab key={tab.key} onPress={go} />;
          return (
            <TabItem
              key={tab.key}
              label={t(tab.label!)}
              icons={tab.icons!}
              focused={focused}
              inactiveColor={theme.textSecondary}
              badge={tab.badge === 'wishlist' ? wishlistCount : 0}
              onPress={go}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabItem({
  label,
  icons,
  focused,
  inactiveColor,
  badge = 0,
  onPress,
}: {
  label: string;
  icons: [IconName, IconName];
  focused: boolean;
  inactiveColor: string;
  badge?: number;
  onPress: () => void;
}) {
  const active = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    active.value = withTiming(focused ? 1 : 0, { duration: 180 });
  }, [focused, active]);

  const lineStyle = useAnimatedStyle(() => ({
    opacity: active.value,
    transform: [{ scaleX: 0.4 + 0.6 * active.value }],
  }));

  return (
    <Pressable style={styles.item} onPress={onPress} hitSlop={6}>
      <Animated.View style={[styles.indicator, lineStyle]} />
      <View>
        <Ionicons name={icons[focused ? 1 : 0]} size={22} color={focused ? BRAND.accent : inactiveColor} />
        {badge > 0 ? (
          <View style={styles.itemBadge} pointerEvents="none">
            <ThemedText style={styles.itemBadgeText}>{badge > 99 ? '99+' : badge}</ThemedText>
          </View>
        ) : null}
      </View>
      <ThemedText
        style={[styles.label, { color: focused ? BRAND.accent : inactiveColor }]}
        numberOfLines={1}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function CartFab({ onPress }: { onPress: () => void }) {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const press = useSharedValue(0);
  const badge = useSharedValue(count > 0 ? 1 : 0);

  // Pop the badge whenever the count changes.
  useEffect(() => {
    badge.value = count > 0 ? withSequence(withTiming(1.35, { duration: 130 }), withSpring(1)) : withTiming(0);
  }, [count, badge]);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1 - press.value * 0.08, { damping: 12 }) }],
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badge.value }],
    opacity: badge.value,
  }));

  return (
    <View style={styles.fabSlot}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (press.value = 1)}
        onPressOut={() => (press.value = 0)}
        hitSlop={10}>
        <Animated.View style={[styles.fab, fabStyle]}>
          <Ionicons name="bag-handle" size={26} color="#fff" />
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.badge, badgeStyle]} pointerEvents="none">
        <ThemedText style={styles.badgeText}>{count > 99 ? '99+' : count}</ThemedText>
      </Animated.View>
    </View>
  );
}

const BAR_HEIGHT = 64;
const FAB_SIZE = 60;

/** Bottom padding tab screens should reserve so content clears the floating bar. */
export const TAB_BAR_CLEARANCE = 110;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_HEIGHT,
    width: '100%',
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.two,
    // soft floating shadow
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, height: '100%' },
  label: { fontFamily: AppFonts.bodySemibold, fontSize: 10, letterSpacing: 0.2 },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: BRAND.accent,
  },
  fabSlot: { flex: 1, alignItems: 'center' },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: BRAND.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -(FAB_SIZE / 2 + 6), // hover above the bar
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: BRAND.accent,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  badge: {
    position: 'absolute',
    top: -(FAB_SIZE / 2 + 2),
    right: '50%',
    marginRight: -34,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#E8543B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: AppFonts.bodyBold, fontSize: 10, color: '#fff' },
  itemBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#E8543B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBadgeText: { fontFamily: AppFonts.bodyBold, fontSize: 9, color: '#fff' },
});
