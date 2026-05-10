import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Field, ScreenState } from '@components/ui';
import { useAppContext } from '@context/AppContext';
import type { RootStackParamList } from '@navigation/types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { ProductCard } from '../components/ProductCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Shop'>;

export function ShopScreen({ navigation }: Props) {
  const {
    addToCart,
    branchInventory,
    isLoggedIn,
    isLoadingProducts,
    productError,
    products,
    refreshProducts,
    searchQuery,
    selectedBranch,
    setSearchQuery,
  } = useAppContext();

  const stockByProductId = useMemo(
    () => new Map(branchInventory.map((item) => [item.product_id, item.stock])),
    [branchInventory]
  );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoadingProducts} onRefresh={refreshProducts} />}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Shop Products</Text>
          <Text style={styles.subtitle}>
            {selectedBranch ? `Inventory from ${selectedBranch.name}` : 'Browse the full catalog'}
          </Text>
        </View>
        <Button label="Cart" variant="secondary" onPress={() => navigation.navigate('Cart')} />
      </View>

      <Field
        label="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search medicines, vitamins, care items"
      />

      {isLoadingProducts ? (
        <ScreenState title="Loading products" isLoading />
      ) : productError ? (
        <ScreenState title="Unable to load products" message={productError} />
      ) : products.length === 0 ? (
        <ScreenState title="No products found" message="Try a different search term." />
      ) : (
        <View style={styles.productList}>
          {products.map((product) => (
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
    gap: spacing.lg,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
  },
  productList: {
    gap: spacing.md,
  },
});
