import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, ScreenState, cardStyles } from '@components/ui';
import { useAppContext } from '@context/AppContext';
import type { RootStackParamList } from '@navigation/types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

export function AccountScreen({ navigation }: Props) {
  const { isLoggedIn, logout, orders, user } = useAppContext();

  if (!isLoggedIn) {
    return (
      <View style={styles.emptyRoot}>
        <ScreenState title="Sign in required" message="Create or access your account to see orders." />
        <Button label="Sign In" onPress={() => navigation.navigate('Auth')} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={[cardStyles.card, styles.section]}>
        <Text style={styles.title}>{user?.full_name}</Text>
        <Text style={styles.copy}>{user?.email}</Text>
        {user?.phone ? <Text style={styles.copy}>{user.phone}</Text> : null}
        <Button label="Sign Out" variant="secondary" onPress={logout} />
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <Button label="Track" variant="ghost" onPress={() => navigation.navigate('OrderStatus')} />
      </View>

      {orders.length === 0 ? (
        <ScreenState title="No local orders yet" message="Orders placed from this app will appear here." />
      ) : (
        <View style={styles.orderList}>
          {orders.map((order) => (
            <View key={order.id} style={[cardStyles.card, styles.section]}>
              <Text style={styles.orderTitle}>{order.orderNumber ?? order.txNo ?? order.id}</Text>
              <Text style={styles.copy}>{order.status}</Text>
              <Text style={styles.copy}>{order.shippingAddress}</Text>
              <Text style={styles.total}>PHP {order.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}
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
  section: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  copy: {
    color: colors.muted,
    fontSize: 14,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderList: {
    gap: spacing.md,
  },
  orderTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  total: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
});
