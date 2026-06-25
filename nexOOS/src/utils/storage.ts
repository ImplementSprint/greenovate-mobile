import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserProfile } from '@/types';

const ACCESS_TOKEN_KEY = 'system4.accessToken';
const USER_PROFILE_KEY = 'system4.userProfile';
const SELECTED_BRANCH_KEY = 'system4.selectedBranch';
const REMEMBER_LOGIN_KEY = 'system4.rememberLogin';
const REMEMBERED_EMAIL_KEY = 'system4.rememberedEmail';

export const tokenStorage = {
  get: () => AsyncStorage.getItem(ACCESS_TOKEN_KEY),
  set: (token: string) => AsyncStorage.setItem(ACCESS_TOKEN_KEY, token),
  clear: () => AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
};

export const profileStorage = {
  get: async () => {
    const rawProfile = await AsyncStorage.getItem(USER_PROFILE_KEY);

    if (!rawProfile) {
      return null;
    }

    return JSON.parse(rawProfile) as UserProfile;
  },
  set: (profile: UserProfile) =>
    AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile)),
  clear: () => AsyncStorage.removeItem(USER_PROFILE_KEY),
};

export const branchStorage = {
  get: () => AsyncStorage.getItem(SELECTED_BRANCH_KEY),
  set: (branchId: string) => AsyncStorage.setItem(SELECTED_BRANCH_KEY, branchId),
  clear: () => AsyncStorage.removeItem(SELECTED_BRANCH_KEY),
};

export const loginPreferenceStorage = {
  getRememberedEmail: () => AsyncStorage.getItem(REMEMBERED_EMAIL_KEY),
  getRememberLogin: async () => (await AsyncStorage.getItem(REMEMBER_LOGIN_KEY)) === 'true',
  set: async (email: string) => {
    await AsyncStorage.multiSet([
      [REMEMBER_LOGIN_KEY, 'true'],
      [REMEMBERED_EMAIL_KEY, email],
    ]);
  },
  clear: async () => {
    await AsyncStorage.multiRemove([REMEMBER_LOGIN_KEY, REMEMBERED_EMAIL_KEY]);
  },
};
