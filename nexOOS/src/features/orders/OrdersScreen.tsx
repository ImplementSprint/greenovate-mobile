import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { BottomNav } from '@/components/AppHeader';
import { Screen } from '@/components/Screen';
import { navigateTab } from '@/navigation/tabNavigation';
import type { ScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { OrderSummary } from '@/types';
import { toMoney } from '@/utils/money';

import { getMyOrders } from './ordersApi';

const formatDate = (value?: string) => {
  if (!value) {
    return 'No date';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-PH', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatStatus = (status: string) => {
  const normalized = status.trim();
  return normalized.length > 0 ? normalized : 'Unknown';
};

const getOrderNumber = (order: OrderSummary) =>
  order.receiptNumber ?? order.orderNumber ?? order.id ?? 'N/A';

export function OrdersScreen({ navigation }: ScreenProps<'Orders'>) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const goToTab = (target: Parameters<typeof navigateTab>[2]) =>
    navigateTab(navigation, 'Orders', target);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await getMyOrders());
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadOrders();
    }, [loadOrders]),
  );

  return (
    <Screen
      contentStyle={styles.content}
      bottomBar={
        <BottomNav
          active="Orders"
          onAccount={() => goToTab('Account')}
          onCart={() => goToTab('Cart')}
          onHome={() => goToTab('Home')}
          onOrders={() => goToTab('Orders')}
          onShop={() => goToTab('Shop')}
        />
      }
    >
      <View style={styles.panel}>
        <Text style={styles.title}>Order History</Text>
        <Text style={styles.count}>{orders.length} order{orders.length === 1 ? '' : 's'} total</Text>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>
              Your recent orders will appear here after checkout.
            </Text>
          </View>
        ) : (
          <View style={styles.stack}>
            {orders.map((order) => (
              <Pressable
                key={order.id}
                accessibilityRole="button"
                onPress={() => navigation.navigate('OrderDetails', { order })}
                style={({ pressed }) => [styles.orderCard, pressed && styles.pressed]}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.receiptWrap}>
                    <Text style={styles.overline}>RECEIPT NO.</Text>
                    <Text style={styles.receiptValue}>{getOrderNumber(order)}</Text>
                  </View>
                  <View style={styles.statusRow}>
                    <View style={styles.statusPill}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>{formatStatus(order.status)}</Text>
                    </View>
                    <Text style={styles.chevron}>{'>'}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardMetaRow}>
                  <View style={styles.metaBlock}>
                    <Text style={styles.overline}>DATE</Text>
                    <Text style={styles.metaValue}>{formatDate(order.createdAt ?? order.date)}</Text>
                  </View>
                  <View style={styles.metaBlock}>
                    <Text style={styles.overline}>TOTAL AMOUNT</Text>
                    <Text style={styles.metaValue}>{toMoney(order.total ?? 0)}</Text>
                  </View>
                  <View style={styles.metaBlock}>
                    <Text style={styles.overline}>ITEMS</Text>
                    <Text style={styles.metaValue}>View Details</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: '#f7faff',
  },
  panel: {
    gap: spacing.lg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  count: {
    color: colors.textMuted,
    fontSize: 14,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyCard: {
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  stack: {
    gap: spacing.md,
  },
  orderCard: {
    gap: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 26,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    shadowColor: colors.text,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  receiptWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  overline: {
    color: '#8aa0c4',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  receiptValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: 999,
    backgroundColor: '#dbeafe',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  statusText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  chevron: {
    color: '#b3c0d5',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metaBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  metaValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.84,
  },
});
