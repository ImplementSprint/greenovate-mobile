import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppHeader, BottomNav } from '@/components/AppHeader';
import { ProductCard } from '@/components/ProductCard';
import { Screen } from '@/components/Screen';
import { runWithAuth } from '@/features/auth/requireAuth';
import { getProducts } from '@/features/catalog/catalogApi';
import { useCart } from '@/features/cart/CartContext';
import { navigateTab } from '@/navigation/tabNavigation';
import type { ScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { Product } from '@/types';

const categories = ['Medicines', 'Vitamins', 'First Aid', 'Personal Care'];

export function HomeScreen({ navigation }: ScreenProps<'Home'>) {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const goToTab = (target: Parameters<typeof navigateTab>[2]) =>
    navigateTab(navigation, 'Home', target);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoadingProducts(true);

      try {
        const nextProducts = await getProducts({ limit: 4 });

        if (active) {
          setProducts(nextProducts);
        }
      } catch (error) {
        if (active) {
          setProducts([]);
        }

        console.warn('Home products unavailable.', error);
      } finally {
        if (active) {
          setLoadingProducts(false);
        }
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Screen
      contentStyle={styles.content}
      topBar={
        <AppHeader
          active="Home"
          showSearchBar
          onAccount={() => navigation.navigate('Account')}
          onCart={() => navigation.navigate('Cart')}
          onHome={() => navigation.navigate('Home')}
          onLogin={() => navigation.navigate('Login')}
          onOrders={() => navigation.navigate('Orders')}
          onSearch={(searchQuery) => navigation.navigate('Shop')}
          onShop={() => navigation.navigate('Shop')}
        />
      }
      bottomBar={
        <BottomNav
          active="Home"
          onAccount={() => goToTab('Account')}
          onCart={() => goToTab('Cart')}
          onHome={() => goToTab('Home')}
          onOrders={() => goToTab('Orders')}
          onShop={() => goToTab('Shop')}
        />
      }
    >
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.title}>PharmaQuick</Text>
          <Text style={styles.subtitle}>
            Your trusted pharmacy, now at your fingertips. Order medicines and
            essentials with ease.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Shop')}
            style={({ pressed }) => [styles.shopPill, pressed && styles.pressed]}
          >
            <Text style={styles.shopPillText}>Shop Now</Text>
            <Text style={styles.shopArrow}>-</Text>
          </Pressable>
        </View>
        <View style={styles.heroArt} pointerEvents="none">
          <View style={[styles.spark, styles.sparkOne]} />
          <View style={[styles.spark, styles.sparkTwo]} />
          <View style={[styles.spark, styles.sparkThree]} />
          <View style={styles.artGlow}>
            <View style={styles.medBadge}>
              <View style={styles.staffLine} />
              <View style={styles.staffTop} />
              <View style={styles.staffBottom} />
              <View style={styles.staffWingLeft} />
              <View style={styles.staffWingRight} />
            </View>
          </View>
          <View style={styles.capsuleBadge}>
            <View style={styles.capsuleTip} />
            <View style={styles.capsuleBody}>
              <View style={styles.capsuleCrossVertical} />
              <View style={styles.capsuleCrossHorizontal} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={[styles.sectionTitle, styles.categoriesTitle]}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              onPress={() => navigation.navigate('Shop')}
              style={({ pressed }) => [styles.categoryChip, pressed && styles.pressed]}
            >
              <Text style={styles.categoryText}>{category}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <Pressable onPress={() => navigation.navigate('Shop')}>
          <Text style={styles.viewAll}>See All</Text>
        </Pressable>
      </View>

      {loadingProducts ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <>
          {products.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No products available from the database right now.</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productCarousel}
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  style={styles.productCard}
                  onAddToCart={() => {
                    void runWithAuth(navigation, () => addItem(product));
                  }}
                  onPress={() => navigation.navigate('ProductDetails', { product })}
                />
              ))}
            </ScrollView>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    paddingBottom: spacing.xxl,
    gap: 0,
    backgroundColor: colors.surface,
  },
  hero: {
    minHeight: 195,
    flexDirection: 'row',
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
    borderRadius: 22,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  heroText: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
    zIndex: 2,
  },
  title: {
    color: colors.surface,
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 35,
  },
  subtitle: {
    maxWidth: 235,
    color: colors.surface,
    fontSize: 16,
    lineHeight: 25,
  },
  shopPill: {
    width: 136,
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  shopPillText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  shopArrow: {
    color: colors.primary,
    fontWeight: '900',
  },
  heroArt: {
    position: 'absolute',
    right: 14,
    top: 12,
    width: 128,
    height: 155,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artGlow: {
    alignItems: 'center',
    backgroundColor: '#4da3ff',
    borderRadius: 32,
    height: 82,
    justifyContent: 'center',
    left: 10,
    opacity: 0.92,
    position: 'absolute',
    top: 50,
    transform: [{ rotate: '-28deg' }],
    width: 66,
  },
  medBadge: {
    alignItems: 'center',
    height: 54,
    justifyContent: 'center',
    transform: [{ rotate: '28deg' }],
    width: 42,
  },
  staffLine: {
    backgroundColor: colors.surface,
    borderRadius: 2,
    height: 45,
    width: 4,
  },
  staffTop: {
    backgroundColor: colors.surface,
    borderRadius: 7,
    height: 13,
    position: 'absolute',
    top: 2,
    width: 13,
  },
  staffBottom: {
    borderBottomColor: colors.surface,
    borderBottomWidth: 3,
    borderLeftColor: 'transparent',
    borderLeftWidth: 8,
    borderRightColor: 'transparent',
    borderRightWidth: 8,
    bottom: 4,
    height: 0,
    position: 'absolute',
    width: 0,
  },
  staffWingLeft: {
    borderColor: colors.surface,
    borderRadius: 10,
    borderWidth: 3,
    height: 22,
    left: 6,
    position: 'absolute',
    top: 20,
    transform: [{ rotate: '32deg' }],
    width: 17,
  },
  staffWingRight: {
    borderColor: colors.surface,
    borderRadius: 10,
    borderWidth: 3,
    height: 22,
    position: 'absolute',
    right: 6,
    top: 20,
    transform: [{ rotate: '-32deg' }],
    width: 17,
  },
  capsuleBadge: {
    height: 87,
    position: 'absolute',
    right: 6,
    top: 18,
    transform: [{ rotate: '26deg' }],
    width: 54,
  },
  capsuleTip: {
    backgroundColor: '#dbeafe',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: 34,
    opacity: 0.95,
  },
  capsuleBody: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    height: 53,
    justifyContent: 'center',
  },
  capsuleCrossVertical: {
    backgroundColor: '#94a3b8',
    borderRadius: 2,
    height: 22,
    position: 'absolute',
    width: 5,
  },
  capsuleCrossHorizontal: {
    backgroundColor: '#94a3b8',
    borderRadius: 2,
    height: 5,
    position: 'absolute',
    width: 22,
  },
  spark: {
    backgroundColor: '#93c5fd',
    borderRadius: 4,
    height: 5,
    position: 'absolute',
    width: 5,
  },
  sparkOne: {
    left: 20,
    top: 22,
  },
  sparkTwo: {
    bottom: 20,
    right: 28,
  },
  sparkThree: {
    right: 50,
    top: 78,
  },
  sectionBlock: {
    paddingTop: spacing.xl,
  },
  categoryRow: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  categoriesTitle: {
    paddingLeft: spacing.xl,
  },
  categoryChip: {
    minHeight: 41,
    minWidth: 116,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#dbeafe',
    paddingHorizontal: spacing.lg,
  },
  categoryText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  viewAll: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  productCarousel: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  productCard: {
    width: 250,
  },
  emptyWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  productGrid: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.surface,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
});
