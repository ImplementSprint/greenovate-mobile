import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, ScreenState, cardStyles } from '@components/ui';
import { useAppContext } from '@context/AppContext';
import type { RootStackParamList } from '@navigation/types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

export function CartScreen({ navigation }: Props) {
  const { cart, cartTotal, updateQuantity } = useAppContext();

  if (cart.length === 0) {
    return (
      <View style={styles.emptyRoot}>
        <ScreenState title="Your cart is empty" message="Add some items before checking out." />
        <Button label="Go to Shop" onPress={() => navigation.navigate('Shop')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cart</Text>
      <View style={styles.list}>
        {cart.map((item) => (
          <View key={item.id} style={[cardStyles.card, styles.item]}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.itemBody}>
              <Text numberOfLines={2} style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>PHP {(item.price * item.quantity).toFixed(2)}</Text>
              <View style={styles.quantityRow}>
                <Button label="-" variant="secondary" onPress={() => updateQuantity(item.id, -1)} />
                <Text style={styles.quantity}>{item.quantity}</Text>
                <Button label="+" variant="secondary" onPress={() => updateQuantity(item.id, 1)} />
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={[cardStyles.card, styles.summary]}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.total}>PHP {cartTotal.toFixed(2)}</Text>
        <Button label="Checkout" onPress={() => navigation.navigate('Checkout')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyRoot: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  list: {
    gap: spacing.md,
  },
  item: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  image: {
    width: 86,
    height: 86,
    borderRadius: 12,
    backgroundColor: '#EEF1ED',
  },
  itemBody: {
    flex: 1,
    gap: spacing.sm,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  price: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  quantityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  quantity: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  summary: {
    gap: spacing.md,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  total: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
});
