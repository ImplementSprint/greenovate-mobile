import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { AccountDetailLayout } from '@/features/account/AccountDetailLayout';
import { accountStyles as styles } from '@/features/account/accountScreenStyles';
import { getDisplayOrderNumber } from '@/features/account/accountShared';
import { getMyOrders } from '@/features/orders/ordersApi';
import type { ScreenProps } from '@/navigation/types';
import type { OrderSummary } from '@/types';
import { toMoney } from '@/utils/money';

export function AccountOrderHistoryScreen({ navigation }: ScreenProps<'AccountOrderHistory'>) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadOrders = async () => {
        setLoading(true);
        try {
          const nextOrders = await getMyOrders();
          if (active) {
            setOrders(nextOrders);
          }
        } catch {
          if (active) {
            setOrders([]);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      void loadOrders();

      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <AccountDetailLayout title="Order History" onBack={() => navigation.goBack()}>
      <View style={styles.detailsCard}>
        {loading ? (
          <ActivityIndicator color="#2563eb" />
        ) : orders.length === 0 ? (
          <View style={styles.centerCard}>
            <View style={styles.centerIcon}>
              <Text style={styles.centerIconText}>▣</Text>
            </View>
            <Text style={styles.centerTitle}>No orders yet</Text>
            <Text style={styles.centerBody}>
              You haven&apos;t placed any orders yet. Start shopping to see your history!
            </Text>
            <Pressable onPress={() => navigation.navigate('Shop')} style={styles.primaryAction}>
              <Text style={styles.primaryActionText}>Go to Shop</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.stack}>
            {orders.map((order) => (
              <View key={order.id} style={styles.infoCard}>
                <Text style={styles.cardHeading}>Order {getDisplayOrderNumber(order)}</Text>
                <Text style={styles.cardBody}>Status: {order.status}</Text>
                <Text style={styles.cardBody}>Total: {toMoney(order.total)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </AccountDetailLayout>
  );
}
