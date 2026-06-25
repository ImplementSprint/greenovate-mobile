import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import type { ScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { toMoney } from '@/utils/money';

const TRACKING_STEPS = [
  {
    key: 'confirmed',
    title: 'Order Confirmed',
    body: 'We received your order and it is being prepared.',
  },
  {
    key: 'transit',
    title: 'In Transit',
    body: 'Your order is on the way to your delivery address.',
  },
  {
    key: 'delivered',
    title: 'Delivered',
    body: 'Order has been successfully delivered and received.',
  },
];

const normalizeStatus = (status?: string) => status?.trim().toLowerCase() ?? '';

const getCompletedStepIndex = (status?: string) => {
  const normalized = normalizeStatus(status);

  if (normalized.includes('deliver')) {
    return 2;
  }

  if (normalized.includes('transit') || normalized.includes('ship') || normalized.includes('out')) {
    return 1;
  }

  return 0;
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return 'Date unavailable';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString('en-PH', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getOrderNumber = (receiptNumber?: string, orderNumber?: string, id?: string) =>
  receiptNumber ?? orderNumber ?? id ?? 'N/A';

export function OrderDetailsScreen({ navigation, route }: ScreenProps<'OrderDetails'>) {
  const { order } = route.params;
  const activeStepIndex = getCompletedStepIndex(order.status);
  const receiptNumber = getOrderNumber(order.receiptNumber, order.orderNumber, order.id);

  return (
    <Screen contentStyle={styles.content}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.stack}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>{'<'}</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Order Details</Text>
            <Text style={styles.headerSubtitle}>Receipt {receiptNumber}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBadge}>
              <Text style={styles.iconText}>{'\u{1F69A}'}</Text>
            </View>
            <Text style={styles.cardTitle}>Order Tracking</Text>
          </View>

          <View style={styles.timeline}>
            {TRACKING_STEPS.map((step, index) => {
              const active = index <= activeStepIndex;
              const last = index === TRACKING_STEPS.length - 1;

              return (
                <View key={step.key} style={styles.timelineRow}>
                  <View style={styles.timelineRail}>
                    <View style={[styles.timelineDot, active && styles.timelineDotActive]} />
                    {last ? null : (
                      <View style={[styles.timelineLine, active && styles.timelineLineActive]} />
                    )}
                  </View>
                  <View style={styles.timelineCopy}>
                    <Text style={[styles.timelineTitle, active && styles.timelineTitleActive]}>
                      {step.title}
                    </Text>
                    <Text style={styles.timelineBody}>{step.body}</Text>
                    {index === activeStepIndex ? (
                      <Text style={styles.timelineTime}>
                        {formatDateTime(order.createdAt ?? order.date)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryBlock}>
            <Text style={styles.label}>RECEIPT NO.</Text>
            <Text style={styles.value}>{receiptNumber}</Text>
          </View>

          <View style={styles.summaryBlock}>
            <Text style={styles.label}>STATUS</Text>
            <Text style={styles.value}>{order.status}</Text>
          </View>

          <View style={styles.summaryBlock}>
            <Text style={styles.label}>DATE</Text>
            <Text style={styles.value}>{formatDateTime(order.createdAt ?? order.date)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL PAID</Text>
            <Text style={styles.totalValue}>{toMoney(order.total ?? 0)}</Text>
          </View>
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpBody}>
            If you have any issues with your order, our support team is available to assist you.
          </Text>
          <Pressable style={({ pressed }) => [styles.helpButton, pressed && styles.pressed]}>
            <Text style={styles.helpButtonText}>Contact Support</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#f7faff',
  },
  stack: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  backText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
  },
  card: {
    gap: spacing.lg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBadge: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#dbeafe',
  },
  iconText: {
    fontSize: 18,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  timeline: {
    gap: spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  timelineRail: {
    alignItems: 'center',
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderColor: '#cbd8ea',
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  timelineDotActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 34,
    backgroundColor: '#dbe5f3',
    marginTop: 4,
  },
  timelineLineActive: {
    backgroundColor: '#3b82f6',
  },
  timelineCopy: {
    flex: 1,
    gap: 2,
    paddingBottom: spacing.sm,
  },
  timelineTitle: {
    color: '#8ca0c4',
    fontSize: 15,
    fontWeight: '900',
  },
  timelineTitleActive: {
    color: colors.text,
  },
  timelineBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  timelineTime: {
    color: '#6d84aa',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  summaryBlock: {
    gap: spacing.xs,
  },
  label: {
    color: '#8aa0c4',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    color: '#8aa0c4',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  totalValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  helpCard: {
    gap: spacing.md,
    borderRadius: 28,
    backgroundColor: colors.primary,
    padding: spacing.xl,
  },
  helpTitle: {
    color: colors.surface,
    fontSize: 22,
    fontWeight: '900',
  },
  helpBody: {
    color: '#dbeafe',
    fontSize: 14,
    lineHeight: 22,
  },
  helpButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  helpButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.84,
  },
});
