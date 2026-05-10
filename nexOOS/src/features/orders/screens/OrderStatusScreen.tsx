import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Field, ScreenState, cardStyles } from '@components/ui';
import { useAppContext } from '@context/AppContext';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import type { Order } from '../../../types';

export function OrderStatusScreen() {
  const { orders, searchOrders } = useAppContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Order[]>(orders);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults(orders);
      return;
    }

    setIsSearching(true);
    try {
      setResults(await searchOrders(query));
    } catch (error) {
      Alert.alert('Search failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Order Status</Text>
      <View style={[cardStyles.card, styles.searchCard]}>
        <Field label="Order number or email" value={query} onChangeText={setQuery} placeholder="ORD-12345" />
        <Button label={isSearching ? 'Searching...' : 'Search Orders'} disabled={isSearching} onPress={handleSearch} />
      </View>

      {results.length === 0 ? (
        <ScreenState title="No orders found" message="Search by order number or place an order first." />
      ) : (
        <View style={styles.list}>
          {results.map((order) => (
            <View key={order.id} style={[cardStyles.card, styles.orderCard]}>
              <Text style={styles.orderTitle}>{order.orderNumber ?? order.txNo ?? order.id}</Text>
              <Text style={styles.status}>{order.status}</Text>
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
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  searchCard: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  orderCard: {
    gap: spacing.sm,
  },
  orderTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  status: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  copy: {
    color: colors.muted,
    fontSize: 14,
  },
  total: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
});
