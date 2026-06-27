import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { CheckoutPaymentMethod, ScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { toMoney } from '@/utils/money';

import { CheckoutSteps } from './CheckoutSteps';

const PAYMENT_METHODS: Array<{
  id: CheckoutPaymentMethod;
  title: string;
  subtitle: string;
}> = [
  { id: 'card', title: 'Credit / Debit Card', subtitle: 'Pay securely with card' },
  { id: 'cash', title: 'Cash', subtitle: 'Pay at the branch' },
  { id: 'gcash', title: 'GCash', subtitle: 'Pay via GCash' },
  { id: 'maya', title: 'Maya', subtitle: 'Pay via Maya' },
];

const paymentLabel = (method: CheckoutPaymentMethod) =>
  PAYMENT_METHODS.find((item) => item.id === method)?.title ?? method;

export function PaymentScreen({ navigation, route }: ScreenProps<'Payment'>) {
  const { draft } = route.params;
  const [selectedMethod, setSelectedMethod] = useState<CheckoutPaymentMethod>('gcash');

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

        <CheckoutSteps current={2} />
      </View>

      <View style={styles.card}>
        <View style={styles.titleRow}>
          <View style={styles.iconBubble}>
            <Text style={styles.iconText}>{'\u{1F4B3}'}</Text>
          </View>
          <Text style={styles.title}>Payment Method</Text>
        </View>

        <View style={styles.methodGrid}>
          {PAYMENT_METHODS.map((method) => {
            const active = selectedMethod === method.id;
            const subtitle =
              method.id === 'cash' && draft.deliveryMethod !== 'branch'
                ? 'Pay when you receive the order'
                : method.subtitle;

            return (
              <Pressable
                key={method.id}
                onPress={() => setSelectedMethod(method.id)}
                style={({ pressed }) => [
                  styles.methodCard,
                  active && styles.methodCardActive,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.methodTop}>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                  <Text style={styles.methodIcon}>{'\u{1F4B3}'}</Text>
                  <View style={styles.methodCopy}>
                    <Text style={styles.methodTitle}>{method.title}</Text>
                    <Text style={styles.methodSubtitle}>{subtitle}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{toMoney(draft.subtotal)}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>{toMoney(draft.deliveryFee)}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={styles.summaryValue}>- {toMoney(draft.discount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <View style={styles.totalValueWrap}>
              <Text style={styles.totalValue}>{toMoney(draft.total)}</Text>
              <Text style={styles.totalVat}>VAT INCLUDED</Text>
            </View>
          </View>
          <View style={styles.noticeSoftCard}>
            <Text style={styles.noticeSoftText}>
              {draft.deliveryMethod === 'branch'
                ? `Pickup at ${draft.branchName}. ${draft.deliveryMessage || 'Preparing pickup details.'}`
                : `Delivering from ${draft.branchName}. ${draft.deliveryMessage || 'Waiting for delivery estimate.'}`}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Review', { draft, paymentMethod: selectedMethod })}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>Review Order {'>'}</Text>
          </Pressable>
        </View>

        <Text style={styles.helperText}>Current selection: {paymentLabel(selectedMethod)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  card: {
    gap: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBubble: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#dbeafe',
  },
  iconText: {
    fontSize: 14,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  methodGrid: {
    gap: spacing.sm,
  },
  methodCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  methodCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#eef4ff',
  },
  methodTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  radio: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#b8c8e2',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  methodIcon: {
    fontSize: 14,
  },
  methodCopy: {
    flex: 1,
    gap: 2,
  },
  methodTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  methodSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
  },
  summaryCard: {
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 22,
    backgroundColor: '#f8fbff',
    padding: spacing.md,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  summaryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  summaryValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  totalLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  totalValueWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  totalValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  totalVat: {
    color: '#8aa0c4',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  noticeSoftCard: {
    borderRadius: 14,
    backgroundColor: '#eef4ff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noticeSoftText: {
    color: '#50688a',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  backButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#eef2f8',
  },
  backButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  primaryButton: {
    flex: 2,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '900',
  },
  helperText: {
    color: '#6c84aa',
    fontSize: 12,
  },
  pressed: {
    opacity: 0.82,
  },
});
