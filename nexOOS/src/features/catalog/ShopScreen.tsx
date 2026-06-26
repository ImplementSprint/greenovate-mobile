import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { AppHeader, BottomNav } from '@/components/AppHeader';
import { ProductCard } from '@/components/ProductCard';
import { Screen } from '@/components/Screen';
import { runWithAuth } from '@/features/auth/requireAuth';
import { useCart } from '@/features/cart/CartContext';
import { navigateTab } from '@/navigation/tabNavigation';
import type { ScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { Product } from '@/types';

import { getProducts, searchProducts } from './catalogApi';

const PRODUCTS_PER_PAGE = 25;
const MAX_VISIBLE_PAGES = 4;
const SORT_OPTIONS = ['For You', 'Price Low to High', 'Price High to Low', 'Name A-Z'] as const;

type SortOption = (typeof SORT_OPTIONS)[number];

const getVisiblePages = (currentPage: number, pageCount: number) => {
  const maxPages = Math.min(MAX_VISIBLE_PAGES, pageCount);
  const start = Math.min(
    Math.max(1, currentPage - Math.floor(maxPages / 2)),
    Math.max(1, pageCount - maxPages + 1),
  );

  return Array.from({ length: maxPages }, (_, index) => start + index);
};

export function ShopScreen({ navigation }: ScreenProps<'Shop'>) {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOptionsOpen, setSortOptionsOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('For You');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const { addItem, refreshCart } = useCart();
  const goToTab = (target: Parameters<typeof navigateTab>[2]) =>
    navigateTab(navigation, 'Shop', target);

  const loadProducts = useCallback(
    async (searchQuery = query) => {
      setLoading(true);
      setPage(1);

      try {
        const nextProducts = searchQuery.trim()
          ? await searchProducts(searchQuery)
          : await getProducts();

        setProducts(nextProducts);
      } catch (error) {
        setProducts([]);
        console.warn('Catalog unavailable.', error);
      } finally {
        setLoading(false);
      }
    },
    [query],
  );

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useFocusEffect(
    useCallback(() => {
      void refreshCart();
    }, [refreshCart]),
  );

  const availableCategories = useMemo(
    () => [
      'All',
      ...Array.from(new Set(products.map((product) => product.category).filter(Boolean))),
    ],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const parsedMinPrice = Number(minPrice);
    const parsedMaxPrice = Number(maxPrice);
    const hasMinPrice = minPrice.trim().length > 0 && !Number.isNaN(parsedMinPrice);
    const hasMaxPrice = maxPrice.trim().length > 0 && !Number.isNaN(parsedMaxPrice);

    const nextProducts = products.filter((product) => {
      if (categoryFilter !== 'All' && product.category !== categoryFilter) {
        return false;
      }

      if (inStockOnly && !(product.stock && product.stock > 0)) {
        return false;
      }

      if (hasMinPrice && product.price < parsedMinPrice) {
        return false;
      }

      if (hasMaxPrice && product.price > parsedMaxPrice) {
        return false;
      }

      return true;
    });

    if (sortOption === 'Price Low to High') {
      return [...nextProducts].sort((left, right) => left.price - right.price);
    }

    if (sortOption === 'Price High to Low') {
      return [...nextProducts].sort((left, right) => right.price - left.price);
    }

    if (sortOption === 'Name A-Z') {
      return [...nextProducts].sort((left, right) => left.name.localeCompare(right.name));
    }

    return nextProducts;
  }, [categoryFilter, inStockOnly, maxPrice, minPrice, products, sortOption]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE,
  );
  const visiblePages = getVisiblePages(safePage, pageCount);

  const clearFilters = () => {
    setCategoryFilter('All');
    setSortOption('For You');
    setSortOptionsOpen(false);
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setPage(1);
  };

  return (
    <Screen
      contentStyle={styles.content}
      topBar={
        <AppHeader
          active="Shop"
          showSearchBar
          onAccount={() => navigation.navigate('Account')}
          onCart={() => navigation.navigate('Cart')}
          onHome={() => navigation.navigate('Home')}
          onLogin={() => navigation.navigate('Login')}
          onSearch={(searchQuery) => {
            setQuery(searchQuery);
            void loadProducts(searchQuery);
          }}
          onShop={() => navigation.navigate('Shop')}
        />
      }
      bottomBar={
        <BottomNav
          active="Shop"
          showCart={false}
          onAccount={() => goToTab('Account')}
          onCart={() => goToTab('Cart')}
          onHome={() => goToTab('Home')}
          onOrders={() => goToTab('Orders')}
          onShop={() => goToTab('Shop')}
        />
      }
    >
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>SHOWING {filteredProducts.length} PRODUCTS</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setFiltersOpen((current) => !current)}
          style={({ pressed }) => [
            styles.filterBar,
            filtersOpen && styles.filterBarActive,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.filterBarIcon}>{'\u2260'}</Text>
          <Text style={styles.filterBarLabel}>FILTER AND SORT</Text>
        </Pressable>
      </View>

      {filtersOpen ? (
        <View style={styles.filterPanel}>
          <View style={styles.filterPanelRow}>
            <Text style={styles.filterMiniLabel}>Sort</Text>
            <Pressable
              onPress={() => {
                setSortOptionsOpen((current) => !current);
              }}
              style={({ pressed }) => [
                styles.sortPill,
                sortOptionsOpen && styles.sortPillOpen,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.sortPillValue}>{sortOption}</Text>
              <Text style={styles.sortPillArrow}>{sortOptionsOpen ? '^' : 'v'}</Text>
            </Pressable>
          </View>

          {sortOptionsOpen ? (
            <View style={styles.sortOptions}>
              {SORT_OPTIONS.map((option) => {
                const active = sortOption === option;

                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setSortOption(option);
                      setSortOptionsOpen(false);
                      setPage(1);
                    }}
                    style={({ pressed }) => [
                      styles.sortOption,
                      active && styles.sortOptionActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.sortOptionText, active && styles.sortOptionTextActive]}>
                      {option}
                    </Text>
                    {active ? <View style={styles.selectedDot} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <Text style={styles.filterMiniLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {availableCategories.map((category) => {
              const active = categoryFilter === category;

              return (
                <Pressable
                  key={category}
                  onPress={() => {
                    setCategoryFilter(category);
                    setPage(1);
                  }}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    active && styles.categoryChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.filterInputsRow}>
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={setMinPrice}
              placeholder="Min price"
              placeholderTextColor={colors.label}
              style={styles.priceInput}
              value={minPrice}
            />
            <TextInput
              keyboardType="decimal-pad"
              onChangeText={setMaxPrice}
              placeholder="Max price"
              placeholderTextColor={colors.label}
              style={styles.priceInput}
              value={maxPrice}
            />
          </View>

          <View style={styles.filterPanelFooter}>
            <Pressable
              onPress={() => {
                setInStockOnly((current) => !current);
                setPage(1);
              }}
              style={({ pressed }) => [
                styles.stockPill,
                inStockOnly && styles.stockPillActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.stockPillText, inStockOnly && styles.stockPillTextActive]}>
                In Stock
              </Text>
            </Pressable>
            <Pressable
              onPress={clearFilters}
              style={({ pressed }) => [styles.clearFiltersButton, pressed && styles.pressed]}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <>
          <View style={styles.list}>
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                compact
                onAddToCart={() => {
                  void runWithAuth(navigation, () => addItem(product));
                }}
                onPress={() => navigation.navigate('ProductDetails', { product })}
                product={product}
                style={styles.gridItem}
              />
            ))}
            {filteredProducts.length === 0 ? (
              <Text style={styles.empty}>No products found.</Text>
            ) : null}
          </View>

          {filteredProducts.length > PRODUCTS_PER_PAGE ? (
            <View style={styles.pagination}>
              <Pressable
                accessibilityLabel="Previous products page"
                accessibilityRole="button"
                disabled={safePage === 1}
                onPress={() => setPage((current) => Math.max(1, current - 1))}
                style={({ pressed }) => [
                  styles.pageButton,
                  safePage === 1 && styles.pageButtonDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.pageArrow, safePage === 1 && styles.pageTextDisabled]}>
                  {'<'}
                </Text>
              </Pressable>
              {visiblePages.map((pageNumber) => (
                <Pressable
                  key={pageNumber}
                  accessibilityLabel={`Products page ${pageNumber}`}
                  accessibilityRole="button"
                  onPress={() => setPage(pageNumber)}
                  style={({ pressed }) => [
                    styles.pageButton,
                    pageNumber === safePage && styles.pageButtonActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[styles.pageText, pageNumber === safePage && styles.pageTextActive]}
                  >
                    {pageNumber}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                accessibilityLabel="Next products page"
                accessibilityRole="button"
                disabled={safePage === pageCount}
                onPress={() => setPage((current) => Math.min(pageCount, current + 1))}
                style={({ pressed }) => [
                  styles.pageButton,
                  safePage === pageCount && styles.pageButtonDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.pageArrow, safePage === pageCount && styles.pageTextDisabled]}>
                  {'>'}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    gap: 0,
    backgroundColor: colors.surface,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  summaryText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 36,
    borderColor: '#5b8cff',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#d9e7ff',
    paddingHorizontal: spacing.md,
  },
  filterBarActive: {
    borderColor: colors.primary,
    backgroundColor: '#c7dcff',
  },
  filterBarIcon: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  filterBarLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  filterPanel: {
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  filterPanelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  filterMiniLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sortPill: {
    minHeight: 34,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    borderColor: '#dbe4f0',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  sortPillOpen: {
    borderColor: colors.primary,
    backgroundColor: '#eef4ff',
  },
  sortPillValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  sortPillArrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  sortOptions: {
    gap: spacing.sm,
  },
  sortOption: {
    alignItems: 'center',
    borderColor: '#e2e8f0',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  sortOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortOptionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  sortOptionTextActive: {
    color: colors.surface,
  },
  selectedDot: {
    backgroundColor: colors.surface,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  categoryRow: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  categoryChip: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
  },
  categoryChipActive: {
    backgroundColor: colors.text,
  },
  categoryChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  categoryChipTextActive: {
    color: colors.surface,
  },
  filterInputsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priceInput: {
    flex: 1,
    minHeight: 42,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  filterPanelFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stockPill: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  stockPillActive: {
    borderColor: colors.primary,
    backgroundColor: '#eef4ff',
  },
  stockPillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  stockPillTextActive: {
    color: colors.primary,
  },
  clearFiltersButton: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  clearFiltersText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
    rowGap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  gridItem: {
    width: '48.5%',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  pageButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  pageButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  pageTextActive: {
    color: colors.surface,
  },
  pageTextDisabled: {
    color: colors.label,
  },
  pageArrow: {
    color: colors.textMuted,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 26,
  },
  pressed: {
    opacity: 0.8,
  },
  empty: {
    width: '100%',
    color: colors.textMuted,
    textAlign: 'center',
  },
});
