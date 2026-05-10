import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AccountScreen } from '@features/account/screens/AccountScreen';
import { AuthScreen } from '@features/auth/screens/AuthScreen';
import { BranchesScreen } from '@features/branches/screens/BranchesScreen';
import { CartScreen } from '@features/cart/screens/CartScreen';
import { CheckoutScreen } from '@features/checkout/screens/CheckoutScreen';
import { HomeScreen } from '@features/home/screens/HomeScreen';
import { OrderStatusScreen } from '@features/orders/screens/OrderStatusScreen';
import { ShopScreen } from '@features/shop/screens/ShopScreen';
import type { RootStackParamList } from '@navigation/types';
import { colors } from '@theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.text, fontWeight: '800' },
          headerTintColor: colors.primary,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'PharmaQuick' }} />
        <Stack.Screen name="Shop" component={ShopScreen} options={{ title: 'Shop' }} />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Account Access' }} />
        <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Account' }} />
        <Stack.Screen name="Branches" component={BranchesScreen} options={{ title: 'Branches' }} />
        <Stack.Screen name="OrderStatus" component={OrderStatusScreen} options={{ title: 'Order Status' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
