import type { RootStackParamList } from '@/navigation/types';
import { tokenStorage } from '@/utils/storage';

type Navigation = {
  navigate: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T],
  ) => void;
};

export async function runWithAuth(
  navigation: Navigation,
  action: () => void,
) {
  const token = await tokenStorage.get();

  if (token) {
    action();
    return;
  }

  navigation.navigate('Login');
}
