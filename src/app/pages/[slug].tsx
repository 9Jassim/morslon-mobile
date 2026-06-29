import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Markdown } from '@/components/markdown';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fetchStorePages } from '@/lib/catalog-api';
import { useI18n } from '@/lib/i18n';
import { BRAND } from '@/lib/theme-colors';
import type { StoreBranch, StoreContact } from '@/lib/types';

type PageKey = 'about' | 'terms' | 'privacy' | 'contact';

export default function StorePageScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useI18n();
  const { data, isLoading, isError } = useQuery({ queryKey: ['store-pages'], queryFn: fetchStorePages });

  const key = (slug ?? 'about') as PageKey;
  const titleKey = (['about', 'terms', 'privacy', 'contact'] as const).includes(key)
    ? (`pages.${key}` as const)
    : 'pages.about';
  const title = t(titleKey);

  return (
    <Screen noPadding>
      <Stack.Screen options={{ headerShown: true, title }} />
      {isLoading ? (
        <Screen centered>
          <ActivityIndicator size="large" />
        </Screen>
      ) : isError ? (
        <Screen centered>
          <ThemedText themeColor="textSecondary">{t('pages.failed')}</ThemedText>
        </Screen>
      ) : key === 'contact' ? (
        <ContactView contact={data!.contact} />
      ) : (
        <MarkdownPage slug={key} data={data!.pages} />
      )}
    </Screen>
  );
}

function MarkdownPage({ slug, data }: { slug: string; data: { slug: string; bodyEn: string; bodyAr: string; updatedAt: string | null }[] }) {
  const { t, pick } = useI18n();
  const page = data.find((p) => p.slug === slug);
  const body = page ? pick(page.bodyEn, page.bodyAr) : '';

  if (!body.trim()) {
    return (
      <Screen centered>
        <ThemedText themeColor="textSecondary">{t('pages.empty')}</ThemedText>
      </Screen>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Markdown source={body} />
    </ScrollView>
  );
}

/** Pull the iframe src URL out of a full embed code, or return the value if it's already a URL. */
function extractMapSrc(raw: string | null): string | null {
  if (!raw) return null;
  const match = raw.match(/src="([^"]+)"/);
  if (match) return match[1];
  if (raw.startsWith('http')) return raw;
  return null;
}

const SOCIALS = [
  { key: 'instagram', icon: 'logo-instagram', url: (v: string) => v },
  { key: 'twitter', icon: 'logo-twitter', url: (v: string) => v },
  { key: 'facebook', icon: 'logo-facebook', url: (v: string) => v },
  { key: 'tiktok', icon: 'logo-tiktok', url: (v: string) => v },
  { key: 'youtube', icon: 'logo-youtube', url: (v: string) => v },
  { key: 'snapchat', icon: 'logo-snapchat', url: (v: string) => v },
] as const;

function ContactView({ contact }: { contact: StoreContact }) {
  const theme = useTheme();
  const { t, pick } = useI18n();

  const open = (url: string) => Linking.openURL(url).catch(() => {});
  const mapSrc = extractMapSrc(contact.mapEmbed);

  const items = [
    contact.phone && {
      icon: 'call-outline' as const,
      label: t('contact.phone'),
      value: contact.phone,
      onPress: () => open(`tel:${contact.phone.replace(/\s/g, '')}`),
    },
    contact.whatsapp && {
      icon: 'logo-whatsapp' as const,
      label: t('contact.whatsapp'),
      value: contact.whatsapp,
      onPress: () => open(`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`),
    },
    contact.email && {
      icon: 'mail-outline' as const,
      label: t('contact.email'),
      value: contact.email,
      onPress: () => open(`mailto:${contact.email}`),
    },
    {
      icon: 'location-outline' as const,
      label: t('contact.address'),
      value: pick(contact.addressEn, contact.addressAr),
      onPress: mapSrc ? () => open(mapSrc) : undefined,
    },
    pick(contact.workingHoursEn, contact.workingHoursAr) && {
      icon: 'time-outline' as const,
      label: t('contact.hours'),
      value: pick(contact.workingHoursEn, contact.workingHoursAr),
      onPress: undefined,
    },
  ].filter(Boolean) as { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; onPress?: () => void }[];

  const socials = SOCIALS.map((s) => ({ ...s, value: contact.social[s.key] })).filter((s) => s.value);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {items.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            disabled={!item.onPress}
            activeOpacity={item.onPress ? 0.7 : 1}
            onPress={item.onPress}
            style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: BRAND.tint }]}>
              <Ionicons name={item.icon} size={18} color={BRAND.accent} />
            </View>
            <View style={styles.rowText}>
              <ThemedText type="small" themeColor="textSecondary">
                {item.label}
              </ThemedText>
              <ThemedText style={styles.rowValue}>{item.value}</ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {socials.length > 0 && (
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            {t('contact.follow')}
          </ThemedText>
          <View style={styles.socialRow}>
            {socials.map((s) => (
              <TouchableOpacity key={s.key} activeOpacity={0.7} onPress={() => open(s.url(s.value))} style={[styles.socialBtn, { backgroundColor: BRAND.tint }]}>
                <Ionicons name={s.icon as keyof typeof Ionicons.glyphMap} size={20} color={BRAND.accent} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {contact.branches.length > 0 && (
        <View style={styles.branches}>
          <ThemedText type="subtitle" style={styles.branchesTitle}>
            {t('contact.branches')}
          </ThemedText>
          {contact.branches.map((b) => (
            <BranchCard key={b.id} branch={b} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function BranchCard({ branch }: { branch: StoreBranch }) {
  const theme = useTheme();
  const { t, pick } = useI18n();
  const open = (url: string) => Linking.openURL(url).catch(() => {});
  const mapSrc = extractMapSrc(branch.mapEmbed);
  const address = pick(branch.addressEn, branch.addressAr);
  const hours = pick(branch.workingHoursEn ?? '', branch.workingHoursAr ?? '');

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <ThemedText style={styles.branchName}>{pick(branch.nameEn, branch.nameAr)}</ThemedText>
      <View style={styles.branchBody}>
        {!!address && (
          <TouchableOpacity disabled={!mapSrc} activeOpacity={mapSrc ? 0.7 : 1} onPress={mapSrc ? () => open(mapSrc) : undefined} style={styles.branchLine}>
            <Ionicons name="location-outline" size={16} color={BRAND.accent} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.branchText}>
              {address}
            </ThemedText>
          </TouchableOpacity>
        )}
        {!!branch.phone && (
          <TouchableOpacity activeOpacity={0.7} onPress={() => open(`tel:${branch.phone!.replace(/\s/g, '')}`)} style={styles.branchLine}>
            <Ionicons name="call-outline" size={16} color={BRAND.accent} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.branchText}>
              {branch.phone}
            </ThemedText>
          </TouchableOpacity>
        )}
        {!!branch.whatsapp && (
          <TouchableOpacity activeOpacity={0.7} onPress={() => open(`https://wa.me/${branch.whatsapp!.replace(/[^0-9]/g, '')}`)} style={styles.branchLine}>
            <Ionicons name="logo-whatsapp" size={16} color={BRAND.accent} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.branchText}>
              {branch.whatsapp}
            </ThemedText>
          </TouchableOpacity>
        )}
        {!!hours && (
          <View style={styles.branchLine}>
            <Ionicons name="time-outline" size={16} color={BRAND.accent} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.branchText}>
              {hours}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: TAB_BAR_CLEARANCE },
  card: { borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.three },
  iconWrap: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 1 },
  rowValue: { fontSize: 15 },
  sectionLabel: { paddingTop: Spacing.three },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, paddingVertical: Spacing.three },
  socialBtn: { width: 40, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  branches: { gap: Spacing.three },
  branchesTitle: { marginBottom: Spacing.one },
  branchName: { fontSize: 16, paddingTop: Spacing.three },
  branchBody: { gap: Spacing.two, paddingVertical: Spacing.three },
  branchLine: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  branchText: { flex: 1 },
});
