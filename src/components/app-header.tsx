import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { API_URL } from '@/lib/api';
import { fetchConfig } from '@/lib/catalog-api';

/** Top bar shown on the main tabs: store logo + search + notifications. */
export function AppHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
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
          onPress={() => router.push('/search')}>
          <Ionicons name="search-outline" size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="Notifications"
          hitSlop={8}
          onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={24} color={theme.text} />
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
  logoWrap: { flex: 1 },
  logo: { width: 120, height: 32, alignSelf: 'flex-start' },
  logoText: { fontSize: 22 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
});
