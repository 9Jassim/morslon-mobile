import { Ionicons } from '@expo/vector-icons';
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

/** Minimal shape of the props expo-router's <Tabs tabBar> passes us. */
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: {
    navigate: (name: string) => void;
    emit: (e: { type: 'tabPress'; target?: string; canPreventDefault: true }) => { defaultPrevented: boolean };
  };
};

type IconName = keyof typeof Ionicons.glyphMap;
const ICONS: Record<string, [IconName, IconName]> = {
  // [inactive, active]
  index: ['home-outline', 'home'],
  categories: ['grid-outline', 'grid'],
  wishlist: ['heart-outline', 'heart'],
  account: ['person-outline', 'person'],
};

const TAB_LABEL: Record<string, 'tabs.home' | 'tabs.categories' | 'tabs.wishlist' | 'tabs.account'> = {
  index: 'tabs.home',
  categories: 'tabs.categories',
  wishlist: 'tabs.wishlist',
  account: 'tabs.account',
};

export function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  function onPress(routeKey: string, routeName: string, isFocused: boolean) {
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(routeName);
  }

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: insets.bottom + 10 }]}>
      <View style={[styles.bar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const labelKey = TAB_LABEL[route.name];
          const label = labelKey ? t(labelKey) : (descriptors[route.key]?.options.title ?? route.name);

          if (route.name === 'cart') {
            return (
              <CartFab key={route.key} onPress={() => onPress(route.key, route.name, isFocused)} />
            );
          }

          return (
            <TabItem
              key={route.key}
              label={label}
              icons={ICONS[route.name] ?? ['ellipse-outline', 'ellipse']}
              focused={isFocused}
              inactiveColor={theme.textSecondary}
              onPress={() => onPress(route.key, route.name, isFocused)}
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
  onPress,
}: {
  label: string;
  icons: [IconName, IconName];
  focused: boolean;
  inactiveColor: string;
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
      <Ionicons name={icons[focused ? 1 : 0]} size={22} color={focused ? BRAND.accent : inactiveColor} />
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
});
