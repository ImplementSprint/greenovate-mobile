import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, ScreenState } from '@components/ui';
import { getAppConfig } from '@config/appConfig';
import { useAppContext } from '@context/AppContext';
import type { RootStackParamList } from '@navigation/types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { ProductCard } from '../../shop/components/ProductCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const partnerBrands = ['Bayer', 'GSK', 'Novartis', 'Sanofi', 'AstraZeneca', 'Unilab', 'Bioten', 'Centrum'];

export function HomeScreen({ navigation }: Props) {
  const { appName, environment } = getAppConfig();
  const {
    addToCart,
    branchInventory,
    isLoggedIn,
    isLoadingProducts,
    products,
    productError,
    selectedBranch,
  } = useAppContext();

  const stockByProductId = useMemo(
    () => new Map(branchInventory.map((item) => [item.product_id, item.stock])),
    [branchInventory]
  );
  const featuredProducts = products.slice(0, 4);

  return (
    <ScrollView testID="home-screen-root" style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>◇</Text>
          <Text style={styles.logoText}>PharmaQuick</Text>
        </View>
        <Button label={isLoggedIn ? 'Cart' : 'Log In'} onPress={() => navigation.navigate(isLoggedIn ? 'Cart' : 'Auth')} />
      </View>

      <View style={styles.navRow}>
        <Pressable onPress={() => navigation.navigate('Home')} style={styles.navItem}>
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Shop')} style={styles.navItem}>
          <Text style={styles.navText}>Shop</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Branches')} style={styles.navItem}>
          <Text style={styles.navText}>⌖ Select Branch</Text>
        </Pressable>
      </View>

      <View style={styles.searchShell}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value=""
          editable={false}
          placeholder="Search medicines, vitamins..."
          placeholderTextColor="#7B8799"
          style={styles.searchInput}
        />
      </View>

      <View style={styles.hero}>
        <Text testID="home-title" accessible={true} style={styles.title}>
          Your Health,{'\n'}
          <Text style={styles.titleAccent}>Delivered Fast</Text>
        </Text>
        <Text style={styles.body}>
          Get your medicines, vitamins, and daily essentials delivered right to your doorstep with {appName}. Safe, reliable, and fast.
        </Text>
        <View style={styles.actions}>
          <Button label="Shop Now" onPress={() => navigation.navigate('Shop')} />
          <Button label={selectedBranch ? selectedBranch.name : '⌖ Choose Branch'} variant="secondary" onPress={() => navigation.navigate('Branches')} />
        </View>
      </View>

      <Text
        testID="maestro-smoke-ready"
        accessibilityLabel="maestro-smoke-ready"
        accessible={true}
        style={styles.smokeMarker}
      >
        MAESTRO_SMOKE_READY {environment}
      </Text>

      <View style={styles.brandSection}>
        <Text style={styles.sectionEyebrow}>Trusted by Top Brands</Text>
        <View style={styles.brandGrid}>
          {partnerBrands.map((brand) => (
            <View key={brand} style={styles.brandWordWrap}>
              <Text style={styles.brandText}>{brand}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <Text style={styles.sectionCopy}>Handpicked essentials for your daily needs.</Text>
        </View>
        <Button label="View All" variant="ghost" onPress={() => navigation.navigate('Shop')} />
      </View>

      {isLoadingProducts ? (
        <ScreenState title="Loading products" isLoading />
      ) : productError ? (
        <ScreenState title="Unable to load products" message={productError} />
      ) : featuredProducts.length === 0 ? (
        <ScreenState title="No products yet" message="Check the API base URL or product data." />
      ) : (
        <View style={styles.productList}>
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              stock={selectedBranch ? stockByProductId.get(product.id) : product.stock}
              onAdd={() => {
                if (!isLoggedIn) {
                  navigation.navigate('Auth');
                  return;
                }

                addToCart(product);
                navigation.navigate('Cart');
              }}
            />
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
    gap: 0,
    paddingBottom: spacing.xl,
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  logoIcon: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
    transform: [{ rotate: '-35deg' }],
  },
  logoText: {
    color: '#020817',
    fontSize: 22,
    fontWeight: '900',
  },
  navRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: colors.heroBackground,
  },
  navItem: {
    paddingVertical: spacing.xs,
  },
  navText: {
    color: '#26364D',
    fontSize: 14,
    fontWeight: '800',
  },
  navTextActive: {
    color: colors.primary,
  },
  searchShell: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#F8FBFF',
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    maxWidth: 440,
    paddingHorizontal: spacing.lg,
    width: '88%',
  },
  searchIcon: {
    color: '#7B8799',
    fontSize: 20,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    minHeight: 48,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.heroBackground,
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: 92,
    paddingTop: 72,
  },
  title: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
    textAlign: 'center',
  },
  titleAccent: {
    color: colors.primary,
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    maxWidth: 360,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
    maxWidth: 320,
    width: '100%',
  },
  smokeMarker: {
    height: 1,
    opacity: 0,
  },
  brandSection: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 42,
  },
  sectionEyebrow: {
    color: '#95A6C2',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  brandGrid: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  brandWordWrap: {
    minWidth: 132,
  },
  brandText: {
    color: '#DDE5F0',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  sectionHeader: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
  },
  sectionCopy: {
    color: colors.muted,
    fontSize: 15,
  },
  productList: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
