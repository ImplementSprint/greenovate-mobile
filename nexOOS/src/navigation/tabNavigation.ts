import { StackActions } from '@react-navigation/native';

import type { RootStackParamList, ScreenProps } from './types';

export type RootTabRoute = 'Home' | 'Shop' | 'Cart' | 'Orders' | 'Account';

export const navigateTab = <T extends keyof RootStackParamList>(
  navigation: ScreenProps<T>['navigation'],
  currentRoute: RootTabRoute,
  targetRoute: RootTabRoute,
) => {
  if (currentRoute === targetRoute) {
    return;
  }

  navigation.dispatch(StackActions.replace(targetRoute));
};
