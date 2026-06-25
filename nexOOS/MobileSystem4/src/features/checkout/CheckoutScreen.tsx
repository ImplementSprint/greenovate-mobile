import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { useCart } from '@/features/cart/CartContext';
import { validatePromo } from '@/features/promos/promoApi';
import type { ScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { toMoney } from '@/utils/money';

const CHECKOUT_STEPS = [
  { number: 1, label: 'Cart' },
  { number: 2, label: 'Shipping' },
  { number: 3, label: 'Payment' },
  { number: 4, label: 'Review' },
];

const MINIMUM_ORDER = 40;
const FREE_DELIVERY_TARGET = 500;

export function CheckoutScreen({ navigation }: ScreenProps<'Checkout'>) {
  const { items, subtotal, updateQuantity } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const total = useMemo(() => Math.max(0, subtotal - discount), [discount, subtotal]);

  const applyPromo = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Promo code needed', 'Enter a promo code first.');
      return;
    }

    try {
      const result = await validatePromo(promoCode, subtotal);
      setDiscount(result.valid ? result.discountAmount : 0);
      Alert.alert(result.valid ? 'Promo applied' : 'Promo unavailable', result.message);
    } catch (error) {
      Alert.alert('Promo unavailable', error instanceof Error ? error.message : 'Try again.');
    }
  };

  const continueToShipping = () => {
    if (items.length === 0) {
      Alert.alert('Cart empty', 'Add products before checkout.');
      return;
    }

    if (subtotal < MINIMUM_ORDER) {
      Alert.alert(
        'Minimum order required',
        `Add ${toMoney(MINIMUM_ORDER - subtotal)} more to continue to shipping.`,
      );
      return;
    }

    navigation.navigate('Shipping');
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityLabel="Back to shop"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => navigation.navigate('Shop')}
          style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
        >
          <Text style={styles.backArrow}>{'<'}</Text>
          <Text style={styles.backText}>Back to Shop</Text>
        </Pressable>

        <View style={styles.stepsRow}>
          {CHECKOUT_STEPS.map((step, index) => {
            const active = index === 0;

            return (
              <View key={step.number} style={styles.stepItem}>
                <View style={[styles.stepBubble, active && styles.stepBubbleActive]}>
                  <Text style={[styles.stepNumber, active && styles.stepNumberActive]}>
                    {step.number}
                  </Text>
                </View>
                <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.cartCard}>
        <Text style={styles.sectionTitle}>Your Cart</Text>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Your cart is empty.</Text>
          </View>
        ) : (
          <>
            {items.map((item) => (
              <View key={item.product.id} style={styles.cartItemRow}>
                <View style={styles.productRow}>
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

                  <View style={styles.productInfo}>
                    <Text numberOfLines={1} style={styles.productName}>
                      {item.product.name}
                    </Text>
                    <Text numberOfLines={1} style={styles.productMeta}>
                      {item.product.category}
                    </Text>
                    <Text style={styles.productPrice}>{toMoney(item.product.price)}</Text>
                  </View>
                </View>

                <View style={styles.quantityRow}>
                  <Pressable
                    onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                    style={({ pressed }) => [
                      styles.quantityButton,
                      styles.quantityButtonLight,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </Pressable>
                  <Text style={styles.quantityValue}>{item.quantity}</Text>
                  <Pressable
                    onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                    style={({ pressed }) => [
                      styles.quantityButton,
                      styles.quantityButtonPrimary,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.quantityButtonTextPrimary}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalValue}>{toMoney(subtotal)}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>

        <Field
          autoCapitalize="characters"
          label="Promo code"
          onChangeText={setPromoCode}
          placeholder="ENTER CODE LIKE HAPPY50"
          value={promoCode}
        />
        <Pressable
          onPress={applyPromo}
          style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryActionText}>Apply Promo</Text>
        </Pressable>

        <View style={styles.summaryList}>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLineLabel}>Subtotal</Text>
            <Text style={styles.summaryLineValue}>{toMoney(subtotal)}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLineLabel}>Delivery</Text>
            <Text style={styles.summaryLinePending}>Calculated at shipping</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLineLabel}>Discount</Text>
            <Text style={styles.summaryLineValue}>- {toMoney(discount)}</Text>
          </View>
        </View>

        <View style={styles.totalBlock}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalAmount}>{toMoney(total)}</Text>
          <Text style={styles.totalHint}>Delivery will be added at shipping</Text>
        </View>

        {subtotal < MINIMUM_ORDER ? (
          <View style={[styles.noticeBox, styles.noticeWarn]}>
            <Text style={styles.noticeWarnText}>
              Minimum order is {toMoney(MINIMUM_ORDER)}. Add {toMoney(MINIMUM_ORDER - subtotal)} more
              to continue.
            </Text>
          </View>
        ) : null}

        {subtotal < FREE_DELIVERY_TARGET ? (
          <View style={styles.neutralBox}>
            <Text style={styles.neutralText}>
              Add {toMoney(FREE_DELIVERY_TARGET - subtotal)} more for free delivery.
            </Text>
          </View>
        ) : (
          <View style={styles.neutralBox}>
            <Text style={styles.neutralText}>You already qualify for free delivery.</Text>
          </View>
        )}

        <View style={styles.securityRow}>
          <Text style={styles.securityIcon}>{'\u{1F512}'}</Text>
          <Text style={styles.securityText}>
            Secure payment processed by PharmaQuick. Your data is protected.
          </Text>
        </View>
      </View>

      <Pressable
        disabled={items.length === 0 || subtotal < MINIMUM_ORDER}
        onPress={continueToShipping}
        style={({ pressed }) => [
          styles.primaryAction,
          (items.length === 0 || subtotal < MINIMUM_ORDER) && styles.primaryActionDisabled,
          pressed && !(items.length === 0 || subtotal < MINIMUM_ORDER) && styles.pressed,
        ]}
      >
        <Text style={styles.primaryActionText}>Continue to Shipping</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#f7faff',
  },
  topRow: {
    gap: spacing.md,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
  },
  backArrow: {
    color: '#6c84aa',
    fontSize: 16,
    fontWeight: '900',
  },
  backText: {
    color: '#50688a',
    fontSize: 13,
    fontWeight: '700',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  stepBubble: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#e7eef8',
  },
  stepBubbleActive: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    color: '#8aa0c4',
    fontSize: 12,
    fontWeight: '900',
  },
  stepNumberActive: {
    color: colors.surface,
  },
  stepLabel: {
    color: '#8aa0c4',
    fontSize: 10,
    fontWeight: '700',
  },
  stepLabelActive: {
    color: colors.primary,
  },
  cartCard: {
    gap: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  emptyState: {
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  cartItemRow: {
    gap: spacing.md,
    borderRadius: 18,
    backgroundColor: '#f7faff',
    padding: spacing.md,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  imageWrap: {
    width: 58,
    height: 58,
    borderRadius: 14,
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
  productInfo: {
    flex: 1,
    gap: 2,
  },
  productName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  productMeta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  productPrice: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: spacing.sm,
  },
  quantityButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  quantityButtonLight: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  quantityButtonPrimary: {
    backgroundColor: colors.primary,
  },
  quantityButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  quantityButtonTextPrimary: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  quantityValue: {
    minWidth: 20,
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  subtotalLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  subtotalValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  summaryCard: {
    gap: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  secondaryAction: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  summaryList: {
    gap: spacing.sm,
  },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLineLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  summaryLineValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  summaryLinePending: {
    color: '#6c84aa',
    fontSize: 12,
    fontWeight: '800',
  },
  totalBlock: {
    alignItems: 'flex-end',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  totalText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  totalAmount: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
  },
  totalHint: {
    color: '#8aa0c4',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  noticeBox: {
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noticeWarn: {
    borderColor: '#f5c25d',
    borderWidth: 1,
    backgroundColor: '#fff9e8',
  },
  noticeWarnText: {
    color: '#b45309',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  neutralBox: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: '#f8fbff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  neutralText: {
    color: '#6c84aa',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: 14,
    backgroundColor: '#f8fbff',
    padding: spacing.md,
  },
  securityIcon: {
    fontSize: 14,
  },
  securityText: {
    flex: 1,
    color: '#6c84aa',
    fontSize: 12,
    lineHeight: 18,
  },
  primaryAction: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
  },
  primaryActionDisabled: {
    opacity: 0.5,
  },
  primaryActionText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.82,
  },
});
