import { StyleSheet } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export const checkoutStyles = StyleSheet.create({
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
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  methodCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#eef4ff',
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
  backButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.82,
  },
  overline: {
    color: '#8aa0c4',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  imageFallbackText: {
    color: colors.primaryDark,
    fontWeight: '900',
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
});
