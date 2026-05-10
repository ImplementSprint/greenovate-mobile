import { StatusBar } from 'expo-status-bar';

import { AppProvider } from '@context/AppContext';
import { RootNavigator } from '@navigation/RootNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </>
  );
}
