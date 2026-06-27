import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import { Button } from '@/components/Button';
import { ProductCard } from '@/components/ProductCard';
import { Screen } from '@/components/Screen';
import { runWithAuth } from '@/features/auth/requireAuth';
import { useCart } from '@/features/cart/CartContext';
import { getProductRecommendations } from '@/features/catalog/catalogApi';
import type { ScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { Product } from '@/types';
import { toMoney } from '@/utils/money';

export function ProductDetailsScreen({ navigation, route }: ScreenProps<'ProductDetails'>) {
  const { product } = route.params;
  const { addItem } = useCart();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  useEffect(() => {
    let active = true;

    const loadRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        const nextRecommendations = await getProductRecommendations(product.id, 4);
        if (active) {
          setRecommendations(nextRecommendations.filter((item) => item.id !== product.id));
        }
      } catch {
        if (active) {
          setRecommendations([]);
        }
      } finally {
        if (active) {
          setIsLoadingRecommendations(false);
        }
      }
    };

    void loadRecommendations();

    return () => {
      active = false;
    };
  }, [product.id]);

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
              return;
            }

            navigation.navigate('Shop');
          }}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>
          {product.name}
        </Text>
      </View>

      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.image} />
      ) : (
        <View style={styles.imageFallback}>
          <Text style={styles.imageText}>{product.name.slice(0, 2).toUpperCase()}</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{toMoney(product.price)}</Text>
        <Text style={styles.stockPill}>
          {product.stock && product.stock > 0
            ? `In Stock${typeof product.stock === 'number' ? ` (${product.stock} available)` : ''}`
            : 'Stock varies by branch'}
        </Text>
        <Text style={styles.description}>{product.description}</Text>
        <Text style={styles.stock}>
          {product.stock && product.stock > 0 ? `${product.stock} available` : 'Stock varies by branch'}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.actionButton}>
          <Button
            label="Add to cart"
            variant="secondary"
            onPress={() => {
              void runWithAuth(navigation, () => {
                addItem(product);
                navigation.navigate('Cart');
              });
            }}
          />
        </View>
        <View style={styles.actionButton}>
          <Button
            label="Buy now"
            onPress={() => {
              void runWithAuth(navigation, () => {
                addItem(product);
                navigation.navigate('Checkout');
              });
            }}
          />
        </View>
      </View>

      {(isLoadingRecommendations || recommendations.length > 0) ? (
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Frequently Bought Together</Text>
          <Text style={styles.sectionSubtitle}>
            Customers who bought this also bought these.
          </Text>
          {isLoadingRecommendations ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Analyzing purchase patterns...</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationsList}>
              {recommendations.map((item) => (
                <View key={item.id} style={styles.recommendationCard}>
                  <Text style={styles.pairedBadge}>Often Paired</Text>
                  <ProductCard
                    compact
                    product={item}
                    onAddToCart={() => {
                      void runWithAuth(navigation, () => {
                        addItem(item);
                      });
                    }}
                    onPress={() => navigation.push('ProductDetails', { product: item })}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  backIcon: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 30,
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  image: {
    width: '100%',
    aspectRatio: 1.4,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
  },
  imageFallback: {
    width: '100%',
    aspectRatio: 1.4,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    color: colors.primaryDark,
    fontSize: 42,
    fontWeight: '900',
  },
  body: {
    gap: spacing.sm,
  },
  category: {
    color: colors.primary,
    fontWeight: '800',
  },
  name: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  price: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: '900',
  },
  stockPill: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    backgroundColor: '#eaf3ff',
    color: colors.primary,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontWeight: '800',
  },
  description: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  stock: {
    color: colors.text,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  recommendationsSection: {
    gap: spacing.sm,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: colors.textMuted,
  },
  loadingBox: {
    alignItems: 'center',
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  loadingText: {
    color: colors.textMuted,
  },
  recommendationsList: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  recommendationCard: {
    width: 180,
    gap: spacing.xs,
  },
  pairedBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#eaf8ef',
    color: '#0c9b45',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
