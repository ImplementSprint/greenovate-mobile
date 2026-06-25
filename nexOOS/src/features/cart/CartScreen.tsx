import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import { BottomNav } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { navigateTab } from '@/navigation/tabNavigation';
import type { ScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { toMoney } from '@/utils/money';

import { useCart } from './CartContext';

export function CartScreen({ navigation }: ScreenProps<'Cart'>) {
  const { isSyncing, items, refreshCart, subtotal, syncMessage, updateQuantity } = useCart();
  const goToTab = (target: Parameters<typeof navigateTab>[2]) =>
    navigateTab(navigation, 'Cart', target);

  useFocusEffect(
    useCallback(() => {
      void refreshCart();
    }, [refreshCart]),
  );

  return (
    <Screen
      bottomBar={
        <BottomNav
          active="Cart"
          onAccount={() => goToTab('Account')}
          onCart={() => goToTab('Cart')}
          onHome={() => goToTab('Home')}
          onOrders={() => goToTab('Orders')}
          onShop={() => goToTab('Shop')}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Pressable
            accessibilityLabel="Go back to shop"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
                return;
              }

              navigation.navigate('Shop');
            }}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Cart</Text>
        </View>
        <Text style={styles.subtitle}>{items.length} item types</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {isSyncing ? 'Loading your saved cart...' : syncMessage || 'Your cart is empty.'}
          </Text>
          <Button label="Refresh cart" variant="secondary" onPress={() => void refreshCart()} />
          <Button label="Shop products" onPress={() => navigation.navigate('Shop')} />
        </View>
      ) : (
        <>
          <View style={styles.list}>
            {items.map((item) => (
              <View key={item.product.id} style={styles.row}>
                <View style={styles.itemTop}>
                  <View style={styles.imageWrap}>
                    {item.product.image ? (
                      <Image source={{ uri: item.product.image }} style={styles.image} />
                    ) : (
                      <View style={styles.imageFallback}>
                        <Text style={styles.imageFallbackText}>
                          {item.product.name.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.itemText}>
                    <Text style={styles.itemName}>{item.product.name}</Text>
                    <Text style={styles.itemMeta}>{toMoney(item.product.price)}</Text>
                  </View>
                </View>
                <View style={styles.quantity}>
                  <Button
                    label="-"
                    variant="secondary"
                    onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                  />
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <Button
                    label="+"
                    variant="secondary"
                    onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                  />
                </View>
              </View>
            ))}
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{toMoney(subtotal)}</Text>
          </View>
          <Button label="Checkout" onPress={() => navigation.navigate('Checkout')} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  backIcon: {
    marginTop: -2,
    color: colors.primary,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 32,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
  },
  empty: {
    gap: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  imageFallbackText: {
    color: colors.primaryDark,
    fontWeight: '900',
  },
  itemText: {
    flex: 1,
    gap: spacing.xs,
  },
  itemName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  itemMeta: {
    color: colors.textMuted,
  },
  quantity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quantityText: {
    minWidth: 28,
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  totalLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  totalValue: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: '900',
  },
});
