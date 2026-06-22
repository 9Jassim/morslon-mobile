import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useCart, type CartItem } from '@/lib/cart-store';
import { resolveProductImage } from '@/lib/images';

export default function CartScreen() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());

  if (items.length === 0) {
    return (
      <Screen centered style={styles.empty}>
        <Ionicons name="cart-outline" size={48} color="#9aa0a6" />
        <ThemedText type="title">Your cart is empty</ThemedText>
        <ThemedText type="small" style={styles.dim}>
          Browse products and add them here.
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
        ListHeaderComponent={
          <ThemedText type="title" style={styles.heading}>
            Cart
          </ThemedText>
        }
        renderItem={({ item }) => (
          <CartRow item={item} onQty={(q) => setQty(item.productId, q)} onRemove={() => remove(item.productId)} />
        )}
      />
      <View style={styles.footer}>
        <View style={styles.subtotalRow}>
          <ThemedText style={styles.subtotalLabel}>Subtotal</ThemedText>
          <ThemedText style={styles.subtotalValue}>{subtotal.toFixed(3)} BHD</ThemedText>
        </View>
        <Button title="Checkout" onPress={() => {}} />
        <ThemedText type="small" style={styles.note}>
          Checkout coming next
        </ThemedText>
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
  const uri = resolveProductImage(item.image);
  return (
    <View style={styles.row}>
      <View style={styles.thumb}>
        {uri ? <Image source={{ uri }} style={styles.thumbImg} contentFit="cover" /> : null}
      </View>
      <View style={styles.rowBody}>
        <ThemedText numberOfLines={2}>{item.nameEn}</ThemedText>
        <ThemedText style={styles.price}>{(item.price * item.quantity).toFixed(3)} BHD</ThemedText>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => onQty(item.quantity - 1)}>
            <Ionicons name="remove" size={18} color="#208AEF" />
          </TouchableOpacity>
          <ThemedText style={styles.qty}>{item.quantity}</ThemedText>
          <TouchableOpacity
            style={[styles.qtyBtn, item.quantity >= item.stock && styles.qtyBtnDisabled]}
            disabled={item.quantity >= item.stock}
            onPress={() => onQty(item.quantity + 1)}>
            <Ionicons name="add" size={18} color="#208AEF" />
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
  dim: { opacity: 0.6 },
  list: { padding: Spacing.three, gap: Spacing.three },
  heading: { marginBottom: Spacing.one },
  row: { flexDirection: 'row', gap: Spacing.three },
  thumb: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f0f0f3' },
  thumbImg: { width: '100%', height: '100%' },
  rowBody: { flex: 1, gap: Spacing.one },
  price: { fontWeight: '700', color: '#208AEF' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.one },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#208AEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qty: { fontSize: 16, minWidth: 20, textAlign: 'center' },
  removeBtn: { marginLeft: 'auto', padding: Spacing.one },
  footer: {
    padding: Spacing.four,
    gap: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e1e6',
  },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtotalLabel: { fontSize: 16 },
  subtotalValue: { fontSize: 18, fontWeight: '800', color: '#208AEF' },
  note: { textAlign: 'center', opacity: 0.6 },
});
