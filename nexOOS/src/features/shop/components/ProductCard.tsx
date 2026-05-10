import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button, cardStyles } from '@components/ui';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import type { Product } from '../../../types';

type ProductCardProps = {
  product: Product;
  stock?: number;
  onAdd: () => void;
};

export function ProductCard({ product, stock, onAdd }: ProductCardProps) {
  const isOutOfStock = typeof stock === 'number' && stock <= 0;

  return (
    <View style={[cardStyles.card, styles.card]}>
      <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.category}>{product.category}</Text>
        <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
        <Text numberOfLines={2} style={styles.description}>{product.description}</Text>
        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>PHP {product.price.toFixed(2)}</Text>
            {typeof stock === 'number' ? (
              <Text style={[styles.stock, isOutOfStock && styles.stockEmpty]}>
                {isOutOfStock ? 'Out of stock' : `${stock} in stock`}
              </Text>
            ) : null}
          </View>
          <Button label="Add" onPress={onAdd} disabled={isOutOfStock} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  image: {
    height: 170,
    width: '100%',
    borderRadius: 14,
    backgroundColor: colors.subtle,
  },
  content: {
    gap: spacing.sm,
  },
  category: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  price: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  stock: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  stockEmpty: {
    color: '#DC2626',
  },
});
