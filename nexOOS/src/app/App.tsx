import { StatusBar } from 'expo-status-bar';

import { BranchProvider } from '@/features/branch/BranchContext';
import { CartProvider } from '@/features/cart/CartContext';
import { RootNavigator } from '@/navigation/RootNavigator';

export default function App() {
  return (
    <BranchProvider>
      <CartProvider>
        <RootNavigator />
        <StatusBar style="dark" />
      </CartProvider>
    </BranchProvider>
  );
}
