import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const CHECKOUT_STEPS = [
  { number: 1, label: 'Cart' },
  { number: 2, label: 'Shipping' },
  { number: 3, label: 'Payment' },
  { number: 4, label: 'Review' },
];

export function CheckoutSteps({ current }: { current: number }) {
  return (
    <View style={styles.stepsRow}>
      {CHECKOUT_STEPS.map((step, index) => {
        const active = index === current;
        const complete = index < current;

        return (
          <View key={step.number} style={styles.stepItem}>
            <View style={[styles.stepBubble, (active || complete) && styles.stepBubbleActive]}>
              <Text style={[styles.stepNumber, (active || complete) && styles.stepNumberActive]}>
                {step.number}
              </Text>
            </View>
            <Text style={[styles.stepLabel, (active || complete) && styles.stepLabelActive]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
