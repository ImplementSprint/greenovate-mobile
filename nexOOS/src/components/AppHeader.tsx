import { ReactNode, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { BranchPickerButton } from '@/features/branch/BranchPickerButton';
import { useCart } from '@/features/cart/CartContext';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { tokenStorage } from '@/utils/storage';

type AppHeaderProps = {
  active?: 'Home' | 'Shop' | 'Cart' | 'Orders' | 'Account';
  onHome: () => void;
  onShop: () => void;
  onLogin: () => void;
  onAccount: () => void;
  onCart: () => void;
  onOrders?: () => void;
  onSearch?: (query: string) => void;
  showSearchBar?: boolean;
};

export function AppHeader({
  onLogin,
  onSearch,
  onCart,
  showSearchBar = false,
}: AppHeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { quantity } = useCart();

  useFocusEffect(
    useCallback(() => {
      let activeCheck = true;

      tokenStorage.get().then((token) => {
        if (activeCheck) {
          setIsLoggedIn(Boolean(token));
        }
      });

      return () => {
        activeCheck = false;
      };
    }, []),
  );

  return (
    <View style={styles.header}>
      {showSearchBar ? (
        <View style={styles.topSearchRow}>
          <View style={styles.searchShell}>
            <Text style={styles.searchIcon}>{'\u2315'}</Text>
            <TextInput
              onChangeText={setSearchValue}
              onSubmitEditing={() => onSearch?.(searchValue)}
              placeholder="Search medicines, vitamins..."
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              style={styles.searchInput}
              value={searchValue}
            />
          </View>
          <View style={styles.topActions}>
            <BranchPickerButton compact />
            <Pressable
              accessibilityLabel={`Open cart with ${quantity} item${quantity === 1 ? '' : 's'}`}
              accessibilityRole="button"
              onPress={onCart}
              style={({ pressed }) => [styles.headerCartButton, pressed && styles.pressed]}
            >
              <Text style={styles.headerCartIcon}>{'\u{1F6D2}'}</Text>
              <View style={styles.headerCartBadge}>
                <Text style={styles.headerCartBadgeText}>{quantity > 99 ? '99+' : quantity}</Text>
              </View>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.metaRow}>
          <BranchPickerButton />
        </View>
      )}

      {isLoggedIn ? null : (
        <Pressable
          onPress={onLogin}
          style={({ pressed }) => [styles.loginLink, pressed && styles.pressed]}
        >
          <Text style={styles.loginLinkText}>Sign in for saved carts and orders</Text>
        </Pressable>
      )}
    </View>
  );
}

type BottomNavProps = Pick<
  AppHeaderProps,
  'active' | 'onHome' | 'onShop' | 'onCart' | 'onAccount' | 'onOrders'
> & {
  showCart?: boolean;
};

export function BottomNav({
  active = 'Home',
  onHome,
  onShop,
  onCart,
  onAccount,
  onOrders,
  showCart = false,
}: BottomNavProps) {
  const { quantity } = useCart();

  return (
    <View style={styles.bottomNav}>
      <NavItem active={active === 'Home'} icon={'\u{1F3E0}'} label="Home" onPress={onHome} />
      <NavItem
        active={active === 'Shop'}
        icon={<ShopTabIcon active={active === 'Shop'} />}
        label="Shop"
        onPress={onShop}
      />
      {showCart ? (
        <NavItem
          active={active === 'Cart'}
          icon={<CartTabIcon active={active === 'Cart'} quantity={quantity} />}
          label="Cart"
          onPress={onCart}
        />
      ) : null}
      <NavItem
        active={active === 'Orders'}
        icon={'\u{1F4E6}'}
        label="Orders"
        onPress={onOrders ?? onAccount}
      />
      <NavItem
        active={active === 'Account'}
        icon={'\u{1F464}'}
        label="Account"
        onPress={onAccount}
      />
    </View>
  );
}

type NavItemProps = {
  active: boolean;
  icon: ReactNode;
  label: string;
  onPress: () => void;
};

function NavItem({ active, icon, label, onPress }: NavItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}
    >
      {typeof icon === 'string' ? (
        <Text style={[styles.navIcon, active && styles.navIconActive]}>{icon}</Text>
      ) : (
        icon
      )}
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function CartTabIcon({ active, quantity }: { active: boolean; quantity: number }) {
  return (
    <View style={styles.cartTabIconWrap}>
      <Text style={[styles.navIcon, active && styles.navIconActive]}>{'\u{1F6D2}'}</Text>
      <View style={styles.cartBadge}>
        <Text style={styles.cartBadgeText}>{quantity > 99 ? '99+' : quantity}</Text>
      </View>
    </View>
  );
}

function ShopTabIcon({ active }: { active: boolean }) {
  const fillColor = active ? colors.primary : '#8ca0c4';

  return (
    <View style={styles.shopTabIconWrap}>
      <View
        style={[styles.shopAwningBlock, styles.shopAwningBlockLeft, { backgroundColor: fillColor }]}
      />
      <View
        style={[styles.shopAwningBlock, styles.shopAwningBlockMidLeft, { backgroundColor: fillColor }]}
      />
      <View
        style={[styles.shopAwningBlock, styles.shopAwningBlockMidRight, { backgroundColor: fillColor }]}
      />
      <View
        style={[styles.shopAwningBlock, styles.shopAwningBlockRight, { backgroundColor: fillColor }]}
      />
      <View style={[styles.shopAwningBase, { backgroundColor: fillColor }]} />
      <View style={[styles.shopBody, { backgroundColor: fillColor }]} />
      <View style={styles.shopDoor} />
      <View style={styles.shopWindow} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  topSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  searchShell: {
    flex: 0,
    width: '60%',
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    shadowColor: colors.text,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 14,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 11,
  },
  headerCartButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCartIcon: {
    color: colors.primary,
    fontSize: 21,
    lineHeight: 22,
  },
  headerCartBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 2,
  },
  headerCartBadgeText: {
    color: colors.surface,
    fontSize: 7,
    fontWeight: '900',
    lineHeight: 8,
  },
  loginLink: {
    alignSelf: 'flex-start',
  },
  loginLinkText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  bottomNav: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    shadowColor: colors.text,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  navItem: {
    width: 66,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navIcon: {
    color: '#8ca0c4',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
  },
  navIconActive: {
    color: colors.primary,
  },
  cartTabIconWrap: {
    width: 30,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopTabIconWrap: {
    width: 30,
    height: 28,
    position: 'relative',
  },
  shopAwningBlock: {
    position: 'absolute',
    top: 1,
    width: 6,
    height: 10,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  shopAwningBlockLeft: {
    left: 1,
    transform: [{ skewX: '-16deg' }],
  },
  shopAwningBlockMidLeft: {
    left: 8,
  },
  shopAwningBlockMidRight: {
    left: 15,
  },
  shopAwningBlockRight: {
    left: 22,
    transform: [{ skewX: '16deg' }],
  },
  shopAwningBase: {
    position: 'absolute',
    top: 11,
    left: 1,
    width: 28,
    height: 3,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  shopBody: {
    position: 'absolute',
    top: 14,
    left: 3,
    width: 24,
    height: 13,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  shopDoor: {
    position: 'absolute',
    top: 16,
    left: 7,
    width: 7,
    height: 10,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  shopWindow: {
    position: 'absolute',
    top: 17,
    right: 7,
    width: 6,
    height: 7,
    backgroundColor: colors.surface,
    borderRadius: 1,
  },
  cartBadge: {
    position: 'absolute',
    top: -1,
    right: -5,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: colors.surface,
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 11,
  },
  navLabel: {
    color: '#8ca0c4',
    fontSize: 12,
    fontWeight: '900',
  },
  navLabelActive: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.82,
  },
});
