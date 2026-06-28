import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { AppHeader, BottomNav } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { getCurrentUser, logout } from '@/features/auth/authApi';
import { accountStyles as styles } from '@/features/account/accountScreenStyles';
import { getDisplayName } from '@/features/account/accountShared';
import { navigateTab } from '@/navigation/tabNavigation';
import type { ScreenProps } from '@/navigation/types';
import type { UserProfile } from '@/types';
import { profileStorage, tokenStorage } from '@/utils/storage';

const menuItems = [
  { label: 'Profile Details', route: 'AccountProfile' as const },
  { label: 'Addresses', route: 'AccountAddresses' as const },
  { label: 'Order History', route: 'AccountOrderHistory' as const },
  { label: 'Refund Requests', route: 'AccountRefundRequests' as const },
  { label: 'Account Settings', route: 'AccountSettings' as const },
];

export function AccountScreen({ navigation }: ScreenProps<'Account'>) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const goToTab = (target: Parameters<typeof navigateTab>[2]) =>
    navigateTab(navigation, 'Account', target);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadProfile = async () => {
        const token = await tokenStorage.get();

        if (!active) return;
        setHasToken(Boolean(token));

        if (!token) {
          setProfile(null);
          return;
        }

        const storedProfile = await profileStorage.get().catch(() => null);
        if (active && storedProfile) {
          setProfile(storedProfile);
        }

        getCurrentUser()
          .then(async (user) => {
            if (!active) return;
            setProfile(user);
            await profileStorage.set(user);
          })
          .catch(() => {
            if (active && !storedProfile) {
              setProfile({ name: 'Customer' });
            }
          });
      };

      void loadProfile();

      return () => {
        active = false;
      };
    }, []),
  );

  const signOut = async () => {
    await logout();
    setProfile(null);
    setHasToken(false);
    Alert.alert('Signed out', 'Your local mobile session was cleared.');
    navigation.navigate('Home');
  };

  if (!hasToken) {
    return (
      <Screen
        contentStyle={styles.content}
        bottomBar={
          <BottomNav
            active="Account"
            onAccount={() => goToTab('Account')}
            onCart={() => goToTab('Cart')}
            onHome={() => goToTab('Home')}
            onOrders={() => goToTab('Orders')}
            onShop={() => goToTab('Shop')}
          />
        }
      >
        <AppHeader
          active="Account"
          onAccount={() => navigation.navigate('Account')}
          onCart={() => navigation.navigate('Cart')}
          onHome={() => navigation.navigate('Home')}
          onLogin={() => navigation.navigate('Login')}
          onShop={() => navigation.navigate('Shop')}
        />
        <View style={styles.signedOutCard}>
          <Text style={styles.title}>My Account</Text>
          <Text style={styles.subtitle}>Log in or create an account to manage your profile.</Text>
          <Button label="Log In" onPress={() => navigation.navigate('Login')} />
          <Button
            label="Create Account"
            variant="secondary"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </Screen>
    );
  }

  const displayName = getDisplayName(profile);

  return (
    <Screen
      contentStyle={styles.content}
      bottomBar={
        <BottomNav
          active="Account"
          onAccount={() => goToTab('Account')}
          onCart={() => goToTab('Cart')}
          onHome={() => goToTab('Home')}
          onOrders={() => goToTab('Orders')}
          onShop={() => goToTab('Shop')}
        />
      }
    >
      <AppHeader
        active="Account"
        onAccount={() => navigation.navigate('Account')}
        onCart={() => navigation.navigate('Cart')}
        onHome={() => navigation.navigate('Home')}
        onLogin={() => navigation.navigate('Login')}
        onShop={() => navigation.navigate('Shop')}
      />

      <View style={styles.page}>
        <Text style={styles.title}>My Account</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{profile?.email || 'Email not loaded yet'}</Text>
          </View>
        </View>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.route}
              onPress={() => navigation.navigate(item.route)}
              style={[styles.menuItem, index === 0 && styles.menuItemActive]}
            >
              <Text style={[styles.menuText, index === 0 && styles.menuTextActive]}>
                {item.label}
              </Text>
              <Text style={[styles.chevron, index === 0 && styles.chevronActive]}>›</Text>
            </Pressable>
          ))}
          <View style={styles.menuDivider} />
          <Pressable onPress={signOut} style={styles.menuItem}>
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
