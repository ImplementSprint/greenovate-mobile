import {
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { Product } from '@/types';
import { toMoney } from '@/utils/money';

type ProductCardProps = {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ProductCard({
  product,
  onPress,
  onAddToCart,
  compact = false,
  style,
}: ProductCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compactCard,
        style,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageWrap}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={[styles.image, compact && styles.compactImage]} />
        ) : (
          <View style={[styles.imageFallback, compact && styles.compactImage]}>
            <Text style={styles.imageFallbackText}>{product.name.slice(0, 2).toUpperCase()}</Text>
          </View>
        )}
        <View style={[styles.badge, compact && styles.compactBadge]}>
          <Text
            numberOfLines={1}
            style={[styles.badgeText, compact && styles.compactBadgeText]}
          >
            {product.category}
          </Text>
        </View>
      </View>
      <Text numberOfLines={compact ? 2 : 1} style={[styles.name, compact && styles.compactName]}>
        {product.name}
      </Text>
      {compact ? null : (
        <Text numberOfLines={2} style={styles.description}>
          {product.description}
        </Text>
      )}
      <View style={[styles.bottomRow, compact && styles.compactBottomRow]}>
        <Text style={[styles.price, compact && styles.compactPrice]}>{toMoney(product.price)}</Text>
        {onAddToCart ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onAddToCart();
            }}
            style={({ pressed }) => [
              styles.addButton,
              compact && styles.compactAddButton,
              pressed && styles.pressed,
            ]}
          >
            <Text numberOfLines={1} style={[styles.addText, compact && styles.compactAddText]}>
              Add
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  compactCard: {
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  imageWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 1.15,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  compactImage: {
    aspectRatio: 1,
    borderRadius: 8,
  },
  imageFallback: {
    width: '100%',
    aspectRatio: 1.15,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  badge: {
    position: 'absolute',
    left: spacing.sm,
    top: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  compactBadge: {
    left: spacing.xs,
    top: spacing.xs,
    borderRadius: 6,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  compactBadgeText: {
    fontSize: 8,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginTop: spacing.sm,
  },
  compactName: {
    minHeight: 34,
    fontSize: 12,
    lineHeight: 16,
    marginTop: spacing.xs,
  },
  description: {
    minHeight: 38,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  compactBottomRow: {
    gap: spacing.xs,
  },
  price: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  compactPrice: {
    fontSize: 12,
  },
  addButton: {
    minHeight: 34,
    borderRadius: 12,
    backgroundColor: '#eef5ff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  compactAddButton: {
    minHeight: 26,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
  },
  addText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  compactAddText: {
    fontSize: 11,
  },
});
