import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useCart } from '@/features/cart/CartContext';
import { placeOrder } from '@/features/orders/ordersApi';
import type { CheckoutPaymentMethod, ScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { toMoney } from '@/utils/money';

import { CheckoutSteps } from './CheckoutSteps';
import { checkoutStyles } from './checkoutStyles';

const paymentLabel = (method: CheckoutPaymentMethod) => {
  switch (method) {
    case 'card':
      return 'Credit / Debit Card';
    case 'cash':
      return 'Cash';
    case 'gcash':
      return 'GCash';
    case 'maya':
      return 'Maya';
    default:
      return method;
  }
};

const deliveryLabel = (method: string) => {
  switch (method) {
    case 'branch':
      return 'Claim at branch';
    case 'same-day':
      return 'Same day delivery';
    case 'scheduled':
      return 'Scheduled delivery';
    default:
      return method;
  }
};

const paymentApiValue = (method: CheckoutPaymentMethod) => {
  switch (method) {
    case 'gcash':
      return 'GCash';
    case 'maya':
      return 'Maya';
    case 'card':
      return 'Credit / Debit Card';
    case 'cash':
      return 'Cash on Delivery';
    default:
      return 'Cash on Delivery';
  }
};

const deliveryApiValue = (method: string) => {
  switch (method) {
    case 'branch':
      return 'claim_at_branch';
    case 'same-day':
      return 'same_day';
    case 'scheduled':
      return 'scheduled';
    default:
      return 'scheduled';
  }
};

export function ReviewScreen({ navigation, route }: ScreenProps<'Review'>) {
  const { draft, paymentMethod } = route.params;
  const { items, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const submit = async () => {
    if (items.length === 0) {
      Alert.alert('Cart empty', 'Add products before placing your order.');
      return;
    }

    setSubmitting(true);
    try {
      await placeOrder({
        customerName: draft.selectedAddress.fullName,
        phone: draft.selectedAddress.phoneNumber,
        address: [
          draft.selectedAddress.streetAddress,
          draft.selectedAddress.city,
          draft.selectedAddress.province,
          draft.selectedAddress.postalCode,
        ]
          .filter(Boolean)
          .join(', '),
        promoCode: draft.promoCode,
        branchId: draft.branchId,
        deliveryMethod: deliveryApiValue(draft.deliveryMethod),
        deliveryFee: draft.deliveryFee,
        paymentMethod: paymentApiValue(paymentMethod),
        items,
      });
      clearCart();
      Alert.alert('Order placed', 'Your order was submitted.');
      navigation.navigate('Orders');
    } catch (error) {
      Alert.alert('Checkout failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Shop')}
          style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
        >
          <Text style={styles.backArrow}>{'<'}</Text>
          <Text style={styles.backText}>Back to Shop</Text>
        </Pressable>

        <CheckoutSteps current={3} />
      </View>

      <View style={styles.card}>
        <View style={styles.titleRow}>
          <View style={styles.iconBubble}>
            <Text style={styles.iconText}>{'\u2713'}</Text>
          </View>
          <Text style={styles.title}>Review & Confirm</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.overline}>PICKUP CONTACT</Text>
            <Text style={styles.infoName}>{draft.selectedAddress.fullName}</Text>
            <Text style={styles.infoBody}>{draft.selectedAddress.phoneNumber}</Text>
            <Text style={styles.infoBody}>
              {draft.branchName}, {draft.selectedAddress.city}, {draft.selectedAddress.province}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.overline}>PAYMENT METHOD</Text>
            <View style={styles.paymentRow}>
              <View style={styles.paymentIcon}>
                <Text style={styles.paymentIconText}>{'\u{1F4B3}'}</Text>
              </View>
              <Text style={styles.infoName}>{paymentLabel(paymentMethod)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.blockCard}>
          <Text style={styles.overline}>DELIVERY METHOD</Text>
          <Text style={styles.blockTitle}>{deliveryLabel(draft.deliveryMethod)}</Text>
          <Text style={styles.blockBody}>
            {draft.deliveryMethod === 'branch'
              ? 'Pick up your order from the branch you selected.'
              : draft.deliveryMethod === 'same-day'
                ? 'Delivery will be arranged from the selected branch to your chosen address.'
                : 'Your order will be scheduled for the selected address.'}
          </Text>
        </View>

        <View style={styles.blockCard}>
          <Text style={styles.overline}>DELIVERY ESTIMATE</Text>
          <Text style={styles.blockTitle}>{toMoney(draft.deliveryFee)}</Text>
          <Text style={styles.blockBody}>{draft.deliveryMessage || 'Estimate pending from branch.'}</Text>
          <Text style={styles.blockBody}>
            {draft.deliveryMethod === 'branch' ? 'Pickup at selected branch' : 'Delivery to selected address'}
          </Text>
        </View>

        <View style={styles.blockCard}>
          <Text style={styles.overline}>PROMO CODE</Text>
          <Text style={styles.promoText}>{draft.promoCode || 'ENTER CODE LIKE HAPPY50'}</Text>
        </View>

        <View style={styles.orderSummarySection}>
          <Text style={styles.overline}>ORDER SUMMARY</Text>
          {items.map((item) => (
            <View key={item.product.id} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
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
                <View style={styles.orderCopy}>
                  <Text numberOfLines={1} style={styles.orderItemName}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.orderItemQty}>Qty: {item.quantity}</Text>
                </View>
              </View>
              <Text style={styles.orderItemPrice}>{toMoney(item.product.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalSummary}>
          <Text style={styles.totalSummaryText}>{totalQuantity} item{totalQuantity === 1 ? '' : 's'}</Text>
          <Text style={styles.totalSummaryText}>Subtotal {toMoney(draft.subtotal)}</Text>
          <Text style={styles.totalSummaryText}>Delivery {toMoney(draft.deliveryFee)}</Text>
          <Text style={styles.totalSummaryText}>Discount - {toMoney(draft.discount)}</Text>
          <Text style={styles.totalSummaryTotal}>Place Order ({toMoney(draft.total)})</Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Pressable
            disabled={submitting}
            onPress={submit}
            style={({ pressed }) => [
              styles.primaryButton,
              submitting && styles.primaryButtonDisabled,
              pressed && !submitting && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {submitting ? 'Placing Order...' : `Place Order (${toMoney(draft.total)})`}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ...checkoutStyles,
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    backgroundColor: '#f7faff',
  },
  topRow: {
    gap: spacing.md,
  },
  iconText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  infoGrid: {
    gap: spacing.sm,
  },
  infoCard: {
    gap: spacing.xs,
    borderRadius: 20,
    backgroundColor: '#f8fbff',
    padding: spacing.md,
  },
  infoName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  infoBody: {
    color: '#50688a',
    fontSize: 12,
    lineHeight: 18,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paymentIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  paymentIconText: {
    fontSize: 14,
  },
  blockCard: {
    gap: spacing.xs,
    borderRadius: 20,
    backgroundColor: '#f8fbff',
    padding: spacing.md,
  },
  blockTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  blockBody: {
    color: '#50688a',
    fontSize: 12,
    lineHeight: 18,
  },
  promoText: {
    color: '#8aa0c4',
    fontSize: 13,
    fontWeight: '900',
  },
  orderSummarySection: {
    gap: spacing.sm,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.sm,
  },
  orderItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  imageWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  orderCopy: {
    flex: 1,
    gap: 2,
  },
  orderItemName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  orderItemQty: {
    color: '#6c84aa',
    fontSize: 11,
  },
  orderItemPrice: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  totalSummary: {
    gap: spacing.xs,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  totalSummaryText: {
    color: '#50688a',
    fontSize: 12,
  },
  totalSummaryTotal: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  backButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#eef2f8',
  },
  primaryButton: {
    flex: 2,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },

});
