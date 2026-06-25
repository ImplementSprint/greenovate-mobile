import { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { AccountDetailLayout } from '@/features/account/AccountDetailLayout';
import { accountStyles as styles } from '@/features/account/accountScreenStyles';
import {
  formatAddressPreview,
  getDisplayName,
  MAX_SAVED_ADDRESSES,
  parseAddresses,
  stringifyAddresses,
} from '@/features/account/accountShared';
import { getCurrentUser, updateProfile } from '@/features/auth/authApi';
import type { ScreenProps } from '@/navigation/types';
import type { UserProfile } from '@/types';
import { profileStorage } from '@/utils/storage';

export function AccountAddressesScreen({ navigation }: ScreenProps<'AccountAddresses'>) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      profileStorage.get().then((stored) => {
        if (active && stored) {
          setProfile(stored);
        }
      });

      getCurrentUser()
        .then(async (user) => {
          if (!active) return;
          setProfile(user);
          await profileStorage.set(user);
        })
        .catch(() => {});

      return () => {
        active = false;
      };
    }, []),
  );

  const addresses = parseAddresses(profile?.address, profile);
  const displayName = getDisplayName(profile);

  const persistAddresses = async (nextAddresses: typeof addresses) => {
    const updatedProfile = await updateProfile({
      full_name: getDisplayName(profile),
      phone: profile?.phone || '',
      birthday: profile?.birthday || profile?.dob,
      address: stringifyAddresses(nextAddresses),
    });

    setProfile(updatedProfile);
    await profileStorage.set(updatedProfile);
  };

  return (
    <AccountDetailLayout
      title="My Addresses"
      subtitle="Manage your saved delivery addresses and choose which one should be the default."
      onBack={() => navigation.goBack()}
    >
      <View style={styles.actionRow}>
        <Text />
        <Pressable
          disabled={addresses.length >= MAX_SAVED_ADDRESSES}
          onPress={() => navigation.navigate('AccountAddressForm', { mode: 'create' })}
          style={styles.primaryAction}
        >
          <Text style={styles.primaryActionText}>+ Add New Address</Text>
        </Pressable>
      </View>

      <View style={styles.detailsCard}>
        {addresses.length === 0 ? (
          <View style={styles.centerCard}>
            <Text style={styles.centerTitle}>No saved addresses yet</Text>
            <Text style={styles.centerBody}>
              Add a delivery address to make checkout faster next time.
            </Text>
          </View>
        ) : (
          <View style={styles.stack}>
            {addresses.map((address, index) => (
              <View key={`${address.label}-${index}`} style={styles.infoCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.detailsTitle}>Address</Text>
                  <Pressable
                    onPress={() =>
                      navigation.navigate('AccountAddressForm', {
                        mode: 'edit',
                        index,
                        address,
                      })
                    }
                    style={styles.linkAction}
                  >
                    <Text style={styles.linkActionText}>Edit</Text>
                  </Pressable>
                </View>
                <Text style={styles.cardBodyStrong}>{address.fullName || displayName}</Text>
                <Text style={styles.cardBody}>{address.phoneNumber || profile?.phone || 'No phone saved'}</Text>
                <Text style={styles.cardBody}>
                  {formatAddressPreview(address) || 'No address details saved yet.'}
                </Text>
                <View style={styles.actionRow}>
                  {index === 0 ? (
                    <Text style={styles.badge}>Default</Text>
                  ) : (
                    <Pressable
                      onPress={() => {
                        const reordered = [addresses[index], ...addresses.filter((_, itemIndex) => itemIndex !== index)];
                        void persistAddresses(reordered).catch((error) => {
                          Alert.alert('Update failed', error instanceof Error ? error.message : 'Could not update the default address.');
                        });
                      }}
                      style={styles.linkAction}
                    >
                      <Text style={styles.linkActionText}>Make Default</Text>
                    </Pressable>
                  )}
                  <Pressable
                    onPress={() => {
                      const nextAddresses = addresses.filter((_, itemIndex) => itemIndex !== index);
                      void persistAddresses(nextAddresses).catch((error) => {
                        Alert.alert('Delete failed', error instanceof Error ? error.message : 'Could not delete this address.');
                      });
                    }}
                    style={styles.linkAction}
                  >
                    <Text style={styles.linkActionText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </AccountDetailLayout>
  );
}
