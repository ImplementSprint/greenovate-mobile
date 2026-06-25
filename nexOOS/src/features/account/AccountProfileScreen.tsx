import { Alert, Image, Pressable, Text, TextInput, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { AccountDetailLayout } from '@/features/account/AccountDetailLayout';
import { accountStyles as styles } from '@/features/account/accountScreenStyles';
import { formatReadableDate, getDisplayName } from '@/features/account/accountShared';
import { getCurrentUser, updateProfile } from '@/features/auth/authApi';
import type { ScreenProps } from '@/navigation/types';
import type { UserProfile } from '@/types';
import { PH_PHONE_MESSAGE, normalizePhilippinePhone } from '@/utils/phone';
import { profileStorage } from '@/utils/storage';

const normalizeDateForInput = (value?: string) => {
  if (!value) {
    return '';
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function AccountProfileScreen({ navigation }: ScreenProps<'AccountProfile'>) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [profileImageTouched, setProfileImageTouched] = useState(false);

  const syncForm = (user: UserProfile | null) => {
    setFullName(getDisplayName(user));
    setPhone(user?.phone || '');
    setBirthday(normalizeDateForInput(user?.birthday || user?.dob));
    setProfileImage(user?.profile_image || user?.profileImage || '');
    setProfileImageTouched(false);
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;

      profileStorage.get().then((stored) => {
        if (active && stored) {
          setProfile(stored);
          syncForm(stored);
        }
      });

      getCurrentUser()
        .then(async (user) => {
          if (!active) return;
          setProfile(user);
          syncForm(user);
          await profileStorage.set(user);
        })
        .catch(() => {});

      return () => {
        active = false;
      };
    }, []),
  );

  const displayName = getDisplayName(profile);
  const saveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Full name required', 'Enter your full name before saving.');
      return;
    }

    const normalizedPhone = phone.trim() ? normalizePhilippinePhone(phone) : null;
    if (phone.trim() && !normalizedPhone) {
      Alert.alert('Invalid phone number', PH_PHONE_MESSAGE);
      return;
    }

    setSaving(true);
    try {
      const updatedProfile = await updateProfile({
        full_name: fullName.trim(),
        phone: normalizedPhone || undefined,
        birthday: birthday.trim() || undefined,
        address: profile?.address,
        profile_image: profileImageTouched ? profileImage || null : undefined,
      });
      setProfile(updatedProfile);
      syncForm(updatedProfile);
      setIsEditing(false);
      await profileStorage.set(updatedProfile);
    } catch (error) {
      Alert.alert(
        'Save failed',
        error instanceof Error ? error.message : 'Could not update your profile.',
      );
    } finally {
      setSaving(false);
    }
  };

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to choose a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
      Alert.alert('Image too large', 'Profile picture must be 2MB or smaller.');
      return;
    }

    if (!asset.base64 || !asset.mimeType) {
      Alert.alert('Image error', 'Could not read that image. Try another one.');
      return;
    }

    setProfileImage(`data:${asset.mimeType};base64,${asset.base64}`);
    setProfileImageTouched(true);
    setIsEditing(true);
  };

  const removeProfileImage = () => {
    setProfileImage('');
    setProfileImageTouched(true);
    setIsEditing(true);
  };

  const profileImageSource = profileImage.trim();

  return (
    <AccountDetailLayout title="Profile Details" onBack={() => navigation.goBack()}>
      <View style={styles.detailsCard}>
        <View style={styles.profileHero}>
          <View style={localStyles.profileHeroRow}>
            <View style={localStyles.avatarWrap}>
              <View style={styles.largeAvatar}>
                {profileImageSource ? (
                  <Image source={{ uri: profileImageSource }} style={localStyles.avatarImage} />
                ) : (
                  <Text style={styles.largeAvatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
                )}
              </View>
              {isEditing ? (
                <Pressable onPress={pickProfileImage} style={localStyles.cameraButton}>
                  <Text style={localStyles.cameraButtonText}>📷</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          <View style={styles.heroText}>
            <Text style={styles.profileLabel}>PROFILE</Text>
            <Text style={styles.greeting}>Hi, {displayName}!</Text>
            <Text style={styles.subtitle}>Welcome back to PharmaQuick.</Text>
            {isEditing ? (
              <View style={localStyles.imageActions}>
                <Text style={styles.cardBody}>Upload a new profile picture. Max size 2MB.</Text>
                {profileImageSource ? (
                  <Pressable onPress={removeProfileImage} style={styles.linkAction}>
                    <Text style={styles.linkActionText}>Remove picture</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.actionRow}>
          <Text />
          {isEditing ? (
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => {
                  syncForm(profile);
                  setIsEditing(false);
                }}
                style={styles.outlineButton}
              >
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </Pressable>
              <Pressable disabled={saving} onPress={saveProfile} style={styles.primaryAction}>
                <Text style={styles.primaryActionText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setIsEditing(true)} style={styles.primaryAction}>
              <Text style={styles.primaryActionText}>Edit Profile</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.formGrid}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput editable={isEditing} onChangeText={setFullName} style={styles.input} value={fullName} />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput editable={false} style={styles.input} value={profile?.email || ''} />
            <Text style={styles.helper}>EMAIL CANNOT BE EDITED HERE</Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <TextInput
              editable={isEditing}
              keyboardType="phone-pad"
              onChangeText={setPhone}
              style={styles.input}
              value={phone}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <TextInput
              editable={isEditing}
              onChangeText={setBirthday}
              placeholder="YYYY-MM-DD"
              style={styles.input}
              value={isEditing ? birthday : formatReadableDate(profile?.birthday || profile?.dob)}
            />
          </View>
        </View>
      </View>
    </AccountDetailLayout>
  );
}

const localStyles = {
  profileHeroRow: {
    marginBottom: 4,
  },
  avatarWrap: {
    position: 'relative' as const,
    width: 96,
    height: 96,
  },
  avatarImage: {
    width: '100%' as const,
    height: '100%' as const,
    borderRadius: 48,
  },
  cameraButton: {
    position: 'absolute' as const,
    right: -4,
    bottom: -4,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#2563eb',
  },
  cameraButtonText: {
    fontSize: 16,
  },
  imageActions: {
    gap: 8,
    marginTop: 8,
  },
};
