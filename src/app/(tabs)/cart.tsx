import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TAB_BAR_CLEARANCE } from '@/components/tab-bar';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { AppFonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart, type CartItem } from '@/lib/cart-store';
import { useI18n } from '@/lib/i18n';
import { resolveProductImage } from '@/lib/images';
import { BRAND } from '@/lib/theme-colors';

export default function CartScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());

  if (items.length === 0) {
    return (
      <Screen centered style={styles.empty}>
        <Ionicons name="bag-handle-outline" size={48} color={theme.textSecondary} />
        <ThemedText type="title">{t('cart.empty')}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
          {t('cart.emptyHint')}
        </ThemedText>
      </Screen>
    );
  }

  return (
    <Screen noPadding>
      <FlatList
        data={items}
        keyExtractor={(i) => i.productId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <ThemedText type="title" style={styles.heading}>
            {t('cart.title')}
          </ThemedText>
        }
        renderItem={({ item }) => (
          <CartRow item={item} onQty={(q) => setQty(item.productId, q)} onRemove={() => remove(item.productId)} />
        )}
      />
      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <View style={styles.subtotalRow}>
          <ThemedText themeColor="textSecondary">{t('cart.subtotal')}</ThemedText>
          <ThemedText style={styles.subtotalValue}>
            {subtotal.toFixed(3)} <ThemedText style={styles.cur}>BHD</ThemedText>
          </ThemedText>
        </View>
        <Button title={t('cart.checkout')} onPress={() => {}} />
      </View>
    </Screen>
  );
}

function CartRow({
  item,
  onQty,
  onRemove,
}: {
  item: CartItem;
  onQty: (q: number) => void;
  onRemove: () => void;
}) {
  const theme = useTheme();
  const uri = resolveProductImage(item.image);
  return (
    <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.thumb, { backgroundColor: theme.backgroundElement }]}>
        {uri ? <Image source={{ uri }} style={styles.thumbImg} contentFit="cover" /> : null}
      </View>
      <View style={styles.rowBody}>
        <ThemedText type="small" numberOfLines={2}>
          {item.nameEn}
        </ThemedText>
        <ThemedText style={styles.price}>{(item.price * item.quantity).toFixed(3)} BHD</ThemedText>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={[styles.qtyBtn, { borderColor: theme.border }]} onPress={() => onQty(item.quantity - 1)}>
            <Ionicons name="remove" size={16} color={BRAND.accent} />
          </TouchableOpacity>
          <ThemedText style={styles.qty}>{item.quantity}</ThemedText>
          <TouchableOpacity
            style={[styles.qtyBtn, { borderColor: theme.border }, item.quantity >= item.stock && styles.qtyBtnDisabled]}
            disabled={item.quantity >= item.stock}
            onPress={() => onQty(item.quantity + 1)}>
            <Ionicons name="add" size={16} color={BRAND.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
            <Ionicons name="trash-outline" size={18} color="#d93025" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { gap: Spacing.two },
  center: { textAlign: 'center' },
  list: { padding: Spacing.three, paddingBottom: TAB_BAR_CLEARANCE, gap: Spacing.three },
  heading: { marginBottom: Spacing.one },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumb: { width: 84, height: 84, borderRadius: Radius.sm, overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  rowBody: { flex: 1, gap: Spacing.one, justifyContent: 'center' },
  price: { fontFamily: AppFonts.displayBold, fontSize: 15, color: BRAND.accent },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: 2 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: { opacity: 0.35 },
  qty: { fontFamily: AppFonts.bodySemibold, fontSize: 15, minWidth: 20, textAlign: 'center' },
  removeBtn: { marginLeft: 'auto', padding: Spacing.one },
  footer: {
    padding: Spacing.four,
    paddingBottom: TAB_BAR_CLEARANCE,
    gap: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  subtotalValue: { fontFamily: AppFonts.displayBold, fontSize: 20, color: BRAND.accent },
  cur: { fontFamily: AppFonts.body, fontSize: 13, color: BRAND.accent },
});
