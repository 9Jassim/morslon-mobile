import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/lib/i18n';
import { API_URL } from '@/lib/api';
import { fetchConfig } from '@/lib/catalog-api';

/** Top bar: store logo + search + notifications. Shows a back button on pushed screens. */
export function AppHeader({ showBack = false }: { showBack?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { isRTL } = useI18n();
  const { data } = useQuery({ queryKey: ['config'], queryFn: fetchConfig });

  const logoUrl = data?.store.logoUrl
    ? data.store.logoUrl.startsWith('http')
      ? data.store.logoUrl
      : `${API_URL}${data.store.logoUrl}`
    : null;

  return (
    <View
      style={[
        styles.bar,
        { paddingTop: insets.top + 8, backgroundColor: theme.background, borderBottomColor: theme.backgroundElement },
      ]}>
      <View style={styles.logoWrap}>
        {showBack ? (
          <TouchableOpacity
            accessibilityLabel="Back"
            hitSlop={8}
            style={[styles.backBtn, { backgroundColor: theme.backgroundElement }]}
            onPress={() => (router.canGoBack() ? router.back() : router.navigate('/'))}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={22} color={theme.text} />
          </TouchableOpacity>
        ) : null}
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logo} contentFit="contain" />
        ) : (
          <ThemedText type="title" style={styles.logoText}>
            {data?.store.nameEn ?? 'Morslon'}
          </ThemedText>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityLabel="Search"
          hitSlop={8}
          style={[styles.iconBtn, { backgroundColor: theme.backgroundElement }]}
          onPress={() => router.push('/search')}>
          <Ionicons name="search-outline" size={20} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="Notifications"
          hitSlop={8}
          style={[styles.iconBtn, { backgroundColor: theme.backgroundElement }]}
          onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logoWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 120, height: 34 },
  logoText: { fontSize: 24, letterSpacing: -0.5 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

