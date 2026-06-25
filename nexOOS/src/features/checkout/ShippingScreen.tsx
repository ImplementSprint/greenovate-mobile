import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  formatAddressPreview,
  getDisplayName,
  parseAddresses,
  type SavedAddress,
} from '@/features/account/accountShared';
import { getCurrentUser } from '@/features/auth/authApi';
import { useBranch } from '@/features/branch/BranchContext';
import { useCart } from '@/features/cart/CartContext';
import { estimateDelivery } from '@/features/delivery/deliveryApi';
import { validatePromo } from '@/features/promos/promoApi';
import type { CheckoutDeliveryMethod, CheckoutDraft, ScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { UserProfile } from '@/types';
import { toMoney } from '@/utils/money';
import { profileStorage } from '@/utils/storage';

const CHECKOUT_STEPS = [
  { number: 1, label: 'Cart' },
  { number: 2, label: 'Shipping' },
  { number: 3, label: 'Payment' },
  { number: 4, label: 'Review' },
];

const DELIVERY_METHODS = [
  {
    id: 'branch',
    title: 'Claim at branch',
    description: 'Pick up your order from the branch you selected.',
  },
  {
    id: 'same-day',
    title: 'Same day delivery',
    description: 'Available for Metro Manila cities and priced from your selected branch.',
  },
  {
    id: 'scheduled',
    title: 'Scheduled delivery',
    description: 'Best for addresses outside Metro Manila.',
  },
] as const;

type DeliveryMethod = CheckoutDeliveryMethod;

const toApiDeliveryMethod = (method: DeliveryMethod) => {
  switch (method) {
    case 'branch':
      return 'claim_at_branch' as const;
    case 'same-day':
      return 'same_day' as const;
    default:
      return 'scheduled' as const;
  }
};

export function ShippingScreen({ navigation }: ScreenProps<'Shipping'>) {
  const { items, subtotal } = useCart();
  const { selectedBranch } = useBranch();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('same-day');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [movingNext, setMovingNext] = useState(false);

  useFocusEffect(
    useCallback(() => {
        let active = true;

        profileStorage.get().then((stored) => {
          if (!active || !stored) {
            return;
          }

          setProfile(stored);
          const parsed = parseAddresses(stored.address, stored);
          setSavedAddresses(parsed);
          setSelectedAddressIndex((current) => Math.min(current, Math.max(parsed.length - 1, 0)));
        });

        getCurrentUser()
          .then(async (user) => {
            if (!active) {
              return;
            }

            setProfile(user);
            const parsed = parseAddresses(user.address, user);
            setSavedAddresses(parsed);
            setSelectedAddressIndex((current) =>
              Math.min(current, Math.max(parsed.length - 1, 0)),
            );
            await profileStorage.set(user);
          })
          .catch(() => {});

        return () => {
          active = false;
        };
      }, []),
  );

  useEffect(() => {
    if (savedAddresses.length === 0) {
      setSelectedAddressIndex(0);
      return;
    }

    if (selectedAddressIndex > savedAddresses.length - 1) {
      setSelectedAddressIndex(0);
    }
  }, [savedAddresses, selectedAddressIndex]);

  const selectedAddress = savedAddresses[selectedAddressIndex] ?? null;
  const orderName = selectedAddress?.fullName || getDisplayName(profile);
  const orderPhone = selectedAddress?.phoneNumber || profile?.phone || '';
  const orderAddress = selectedAddress ? formatAddressPreview(selectedAddress) : '';

  useEffect(() => {
    let active = true;

    if (!selectedAddress) {
      setDeliveryFee(0);
      setDeliveryMessage('');
      return () => {
        active = false;
      };
    }

    if (deliveryMethod === 'branch') {
      setDeliveryFee(0);
      setDeliveryMessage('Ready for branch pickup');
      return () => {
        active = false;
      };
    }

    void estimateDelivery({
      address: selectedAddress.streetAddress || orderAddress,
      city: selectedAddress.city || '',
      province: selectedAddress.province || '',
      branchId: selectedBranch?.id,
      deliveryMethod: toApiDeliveryMethod(deliveryMethod),
    })
      .then((estimate) => {
        if (!active) {
          return;
        }

        setDeliveryFee(Number(estimate?.fee ?? 0));
        setDeliveryMessage(
          estimate?.message ||
            (estimate?.etaLabel
              ? `${estimate.etaLabel}${estimate.matchedLocation ? ` | ${estimate.matchedLocation}` : ''}`
              : `ETA: ${
                  estimate?.etaMinutes ? `${estimate.etaMinutes} mins` : 'Pending'
                } | Delivery fee: ${toMoney(estimate?.fee ?? 0)}`),
        );
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setDeliveryFee(0);
        setDeliveryMessage('Delivery estimate unavailable right now.');
      });

    return () => {
      active = false;
    };
  }, [deliveryMethod, orderAddress, selectedAddress, selectedBranch?.id]);

  const total = useMemo(
    () => Math.max(0, subtotal + deliveryFee - discount),
    [deliveryFee, discount, subtotal],
  );

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

  const continueToPayment = async () => {
    if (items.length === 0) {
      Alert.alert('Cart empty', 'Add products before checkout.');
      return;
    }

    if (!selectedAddress) {
      Alert.alert('Choose address', 'Select a saved address before placing your order.');
      return;
    }

    setMovingNext(true);
    const draft: CheckoutDraft = {
      selectedAddress,
      selectedAddressIndex,
      deliveryMethod,
      branchId: selectedBranch?.id,
      promoCode,
      discount,
      deliveryFee,
      deliveryMessage,
      subtotal,
      total,
      branchName: selectedBranch?.name ?? 'Not selected',
    };
    navigation.navigate('Payment', { draft });
    setMovingNext(false);
  };

  return (
    <>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
              const active = index === 1;
              const complete = index < 1;

              return (
                <View key={step.number} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepBubble,
                      (active || complete) && styles.stepBubbleActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNumber,
                        (active || complete) && styles.stepNumberActive,
                      ]}
                    >
                      {step.number}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      (active || complete) && styles.stepLabelActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.shippingCard}>
          <View style={styles.headingRow}>
            <View style={styles.headingIcon}>
              <Text style={styles.headingIconText}>{'\u{1F4CD}'}</Text>
            </View>
            <Text style={styles.title}>Shipping Information</Text>
          </View>

          <View style={styles.groupCard}>
            <Text style={styles.overline}>DELIVERY METHOD</Text>
            <View style={styles.methodRow}>
              {DELIVERY_METHODS.map((method) => {
                const active = deliveryMethod === method.id;

                return (
                  <Pressable
                    key={method.id}
                    onPress={() => setDeliveryMethod(method.id)}
                    style={({ pressed }) => [
                      styles.methodCard,
                      active && styles.methodCardActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.methodKicker}>{method.id.toUpperCase().replace('-', ' ')}</Text>
                    <Text style={styles.methodTitle}>{method.title}</Text>
                    <Text style={styles.methodBody}>{method.description}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.branchLine}>
              Fulfillment branch: <Text style={styles.branchLineStrong}>{selectedBranch?.name ?? 'Not selected'}</Text>
            </Text>
          </View>

          <View style={styles.groupCard}>
            <View style={styles.addressHeader}>
              <View style={styles.addressCopy}>
                <Text style={styles.overline}>SAVED ADDRESSES</Text>
                <Text style={styles.addressHint}>
                  Pick one of your saved delivery addresses from the list below.
                </Text>
              </View>
              <Pressable
                onPress={() => setAddressPickerOpen(true)}
                style={({ pressed }) => [styles.chooseButton, pressed && styles.pressed]}
              >
                <Text style={styles.chooseButtonText}>Choose Address</Text>
              </Pressable>
            </View>

            {selectedAddress ? (
              <View style={styles.selectedAddressCard}>
                <View style={styles.selectedAddressTop}>
                  <Text style={styles.overlineBlue}>SELECTED ADDRESS</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.homeBadge}>
                      <Text style={styles.homeBadgeText}>{selectedAddress.label.toUpperCase()}</Text>
                    </View>
                    {selectedAddressIndex === 0 ? (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <Text style={styles.selectedName}>{selectedAddress.fullName}</Text>
                <Text style={styles.selectedPhone}>{selectedAddress.phoneNumber}</Text>
                <Text style={styles.selectedAddressText}>{formatAddressPreview(selectedAddress)}</Text>
              </View>
            ) : (
              <View style={styles.emptyAddressCard}>
                <Text style={styles.emptyAddressTitle}>No saved address selected</Text>
                <Text style={styles.emptyAddressText}>
                  Save an address in your account first, then choose it here for delivery.
                </Text>
                <Pressable
                  onPress={() => navigation.navigate('AccountAddresses')}
                  style={({ pressed }) => [styles.manageButton, pressed && styles.pressed]}
                >
                  <Text style={styles.manageButtonText}>Manage Addresses</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.deliveryInfoCard}>
            <Text style={styles.deliveryInfoText}>Delivery fee: {toMoney(deliveryFee)}</Text>
            <Text style={styles.deliveryInfoText}>
              ETA: {deliveryMessage || 'Delivery estimate will appear once available.'}
            </Text>
            <Text style={styles.deliveryInfoMeta}>
              MATCHED AREA: {selectedAddress?.city?.toUpperCase() || 'NO ADDRESS SELECTED'}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>
            <View style={styles.promoShell}>
              <Text style={styles.overline}>PROMO CODE</Text>
              <Pressable
                onPress={applyPromo}
                style={({ pressed }) => [styles.promoInput, pressed && styles.pressed]}
              >
                <Text style={styles.promoInputText}>
                  {promoCode || 'ENTER CODE LIKE HAPPY50'}
                </Text>
              </Pressable>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{toMoney(subtotal)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>{toMoney(deliveryFee)}</Text>
            </View>
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>- {toMoney(discount)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <View style={styles.totalValueWrap}>
                <Text style={styles.totalValue}>{toMoney(total)}</Text>
                <Text style={styles.totalVat}>VAT INCLUDED</Text>
              </View>
            </View>

            <View style={styles.noticeInfoCard}>
              <Text style={styles.noticeInfoText}>
                Order cutoff is 21:00. Your order will be queued for tomorrow.
              </Text>
            </View>
            <View style={styles.noticeNeutralCard}>
              <Text style={styles.noticeNeutralText}>
                Add {toMoney(Math.max(0, 500 - total))} more for free delivery.
              </Text>
            </View>
            <View style={styles.noticeSoftCard}>
              <Text style={styles.noticeSoftText}>
                Secure payment processed by PharmaQuick. Your data is protected.
              </Text>
            </View>
            <View style={styles.noticeSoftCard}>
              <Text style={styles.noticeSoftText}>
                Delivering from {selectedBranch?.name ?? 'selected branch'}.{' '}
                {deliveryMessage || 'Estimated time pending.'}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              disabled={movingNext || !selectedAddress}
              onPress={continueToPayment}
              style={({ pressed }) => [
                styles.primaryAction,
                (movingNext || !selectedAddress) && styles.primaryActionDisabled,
                pressed && !movingNext && selectedAddress && styles.pressed,
              ]}
            >
              <Text style={styles.primaryActionText}>
                {movingNext ? 'Opening Payment...' : 'Continue to Payment'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.backCartButton, pressed && styles.pressed]}
            >
              <Text style={styles.backCartButtonText}>{'<'} Back to Cart</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal animationType="fade" transparent visible={addressPickerOpen} onRequestClose={() => setAddressPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalScrim} onPress={() => setAddressPickerOpen(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.overline}>CHOOSE ADDRESS</Text>
                <Text style={styles.modalTitle}>Saved Addresses</Text>
                <Text style={styles.modalSubtitle}>
                  Select an existing address for this order or add a new one here.
                </Text>
              </View>
              <Pressable onPress={() => setAddressPickerOpen(false)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>×</Text>
              </Pressable>
            </View>
            <View style={styles.modalToolbar}>
              <Text style={styles.modalCount}>
                {savedAddresses.length} saved address{savedAddresses.length === 1 ? '' : 'es'} available
              </Text>
              <Pressable
                onPress={() => {
                  setAddressPickerOpen(false);
                  navigation.navigate('AccountAddressForm', { mode: 'create' });
                }}
                style={({ pressed }) => [styles.modalAddButton, pressed && styles.pressed]}
              >
                <Text style={styles.modalAddButtonText}>Add New Address</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalList} showsVerticalScrollIndicator={false}>
              {savedAddresses.map((address, index) => {
                const active = index === selectedAddressIndex;

                return (
                  <Pressable
                    key={`${address.label}-${index}`}
                    onPress={() => {
                      setSelectedAddressIndex(index);
                      setAddressPickerOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.modalAddressCard,
                      active && styles.modalAddressCardActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.modalAddressTop}>
                      <Text style={styles.modalAddressName}>{address.fullName || getDisplayName(profile)}</Text>
                      <View style={styles.badgeRow}>
                        <View style={styles.homeBadge}>
                          <Text style={styles.homeBadgeText}>{address.label.toUpperCase()}</Text>
                        </View>
                        {index === 0 ? (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <Text style={styles.modalAddressPhone}>{address.phoneNumber || profile?.phone || 'No phone saved'}</Text>
                    <Text style={styles.modalAddressText}>{formatAddressPreview(address)}</Text>
                  </Pressable>
                );
              })}

              {savedAddresses.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Text style={styles.emptyAddressTitle}>No saved addresses yet</Text>
                  <Text style={styles.emptyAddressText}>
                    Add an address in your account so you can select it during checkout.
                  </Text>
                  <Pressable
                    onPress={() => {
                      setAddressPickerOpen(false);
                      navigation.navigate('AccountAddresses');
                    }}
                    style={({ pressed }) => [styles.manageButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.manageButtonText}>Open My Addresses</Text>
                  </Pressable>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: '#f7faff',
  },
  topRow: {
    gap: spacing.md,
    paddingTop: spacing.sm,
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
  shippingCard: {
    gap: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 30,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headingIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#dbeafe',
  },
  headingIconText: {
    fontSize: 14,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  groupCard: {
    gap: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  overline: {
    color: '#8aa0c4',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  overlineBlue: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  methodRow: {
    gap: spacing.sm,
  },
  methodCard: {
    gap: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: '#f9fbff',
    padding: spacing.md,
  },
  methodCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#eef4ff',
  },
  methodKicker: {
    color: '#8aa0c4',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  methodTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  methodBody: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  branchLine: {
    color: colors.textMuted,
    fontSize: 12,
  },
  branchLineStrong: {
    color: colors.text,
    fontWeight: '900',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  addressCopy: {
    flex: 1,
    gap: 2,
  },
  addressHint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  chooseButton: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#b8cdf3',
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  chooseButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  selectedAddressCard: {
    gap: spacing.xs,
    borderColor: '#b8cdf3',
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: '#fbfdff',
    padding: spacing.md,
  },
  selectedAddressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  homeBadge: {
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  homeBadgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '900',
  },
  defaultBadge: {
    borderRadius: 999,
    backgroundColor: '#fff1d8',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  defaultBadgeText: {
    color: '#ff7a00',
    fontSize: 10,
    fontWeight: '900',
  },
  selectedName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  selectedPhone: {
    color: '#5f7aa2',
    fontSize: 12,
  },
  selectedAddressText: {
    color: '#50688a',
    fontSize: 12,
    lineHeight: 18,
  },
  emptyAddressCard: {
    gap: spacing.sm,
    borderRadius: 18,
    backgroundColor: '#f8fbff',
    padding: spacing.md,
  },
  emptyAddressTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyAddressText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  manageButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  manageButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  deliveryInfoCard: {
    gap: spacing.xs,
    borderColor: '#b8cdf3',
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: '#eef4ff',
    padding: spacing.md,
  },
  deliveryInfoText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  deliveryInfoMeta: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  summaryCard: {
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 26,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  promoShell: {
    gap: spacing.xs,
    borderRadius: 18,
    backgroundColor: '#f8fbff',
    padding: spacing.md,
  },
  promoInput: {
    minHeight: 40,
    justifyContent: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  promoInputText: {
    color: '#8aa0c4',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
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
  totalValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  totalValueWrap: {
    alignItems: 'flex-end',
    gap: 2,
  },
  totalVat: {
    color: '#8aa0c4',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  noticeInfoCard: {
    borderColor: '#9dc0ff',
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: '#eef4ff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noticeInfoText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  noticeNeutralCard: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noticeNeutralText: {
    color: '#6c84aa',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  noticeSoftCard: {
    borderRadius: 14,
    backgroundColor: '#f8fbff',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noticeSoftText: {
    color: '#6c84aa',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  actionRow: {
    gap: spacing.sm,
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
  backCartButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#eef2f8',
    paddingHorizontal: spacing.lg,
  },
  backCartButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(6, 20, 43, 0.18)',
  },
  modalScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    maxHeight: '82%',
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  modalTitleWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  modalClose: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  modalCloseText: {
    color: colors.label,
    fontSize: 28,
    lineHeight: 30,
  },
  modalToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  modalCount: {
    flex: 1,
    color: '#6c84aa',
    fontSize: 12,
  },
  modalAddButton: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
  },
  modalAddButtonText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: '900',
  },
  modalList: {
    gap: spacing.md,
  },
  modalAddressCard: {
    gap: spacing.xs,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  modalAddressCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#eef4ff',
  },
  modalAddressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  modalAddressName: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  modalAddressPhone: {
    color: '#5f7aa2',
    fontSize: 12,
  },
  modalAddressText: {
    color: '#50688a',
    fontSize: 13,
    lineHeight: 20,
  },
  modalEmpty: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  pressed: {
    opacity: 0.82,
  },
});
