import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Field, ScreenState, cardStyles } from '@components/ui';
import { useAppContext } from '@context/AppContext';
import type { RootStackParamList } from '@navigation/types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

export function CheckoutScreen({ navigation }: Props) {
  const { cart, cartTotal, placeOrder, selectedBranch, user } = useAppContext();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Manila');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cart.length === 0) {
    return (
      <View style={styles.emptyRoot}>
        <ScreenState title="Nothing to checkout" message="Your cart is empty." />
        <Button label="Shop Products" onPress={() => navigation.navigate('Shop')} />
      </View>
    );
  }

  const handlePlaceOrder = async () => {
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      Alert.alert('Missing delivery info', 'Please complete your name, phone, address, and city.');
      return;
    }

    setIsSubmitting(true);
    try {
      await placeOrder({
        shippingAddress: [address, city].filter(Boolean).join(', '),
        paymentMethod,
        deliveryFee: 0,
      });
      Alert.alert('Order placed', 'Your order is now processing.');
      navigation.navigate('Account');
    } catch (error) {
      Alert.alert('Checkout failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Checkout</Text>
      <View style={[cardStyles.card, styles.section]}>
        <Text style={styles.sectionTitle}>Delivery</Text>
        {selectedBranch ? <Text style={styles.copy}>Delivering from {selectedBranch.name}</Text> : null}
        <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Juan Dela Cruz" />
        <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="09XX XXX XXXX" />
        <Field label="Address" value={address} onChangeText={setAddress} multiline placeholder="Street, barangay, building" />
        <Field label="City" value={city} onChangeText={setCity} placeholder="Manila" />
      </View>

      <View style={[cardStyles.card, styles.section]}>
        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.paymentGrid}>
          {['Cash on Delivery', 'GCash', 'Maya', 'Credit / Debit Card'].map((method) => (
            <Button
              key={method}
              label={method}
              variant={paymentMethod === method ? 'primary' : 'secondary'}
              onPress={() => setPaymentMethod(method)}
            />
          ))}
        </View>
      </View>

      <View style={[cardStyles.card, styles.section]}>
        <Text style={styles.sectionTitle}>Summary</Text>
        {cart.map((item) => (
          <View key={item.id} style={styles.summaryLine}>
            <Text style={styles.copy}>{item.quantity}x {item.name}</Text>
            <Text style={styles.copyStrong}>PHP {(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.summaryLine}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>PHP {cartTotal.toFixed(2)}</Text>
        </View>
        <Button label={isSubmitting ? 'Placing Order...' : 'Place Order'} disabled={isSubmitting} onPress={handlePlaceOrder} />
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
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  copy: {
    flex: 1,
    color: colors.muted,
    fontSize: 14,
  },
  copyStrong: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  paymentGrid: {
    gap: spacing.sm,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  totalLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  total: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
});
