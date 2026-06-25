import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AccountAddressesScreen } from '@/features/account/AccountAddressesScreen';
import { AccountAddressFormScreen } from '@/features/account/AccountAddressFormScreen';
import { AccountOrderHistoryScreen } from '@/features/account/AccountOrderHistoryScreen';
import { AccountProfileScreen } from '@/features/account/AccountProfileScreen';
import { AccountRefundRequestsScreen } from '@/features/account/AccountRefundRequestsScreen';
import { AccountScreen } from '@/features/account/AccountScreen';
import { AccountSettingsScreen } from '@/features/account/AccountSettingsScreen';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { RegisterScreen } from '@/features/auth/RegisterScreen';
import { CartScreen } from '@/features/cart/CartScreen';
import { CheckoutScreen } from '@/features/checkout/CheckoutScreen';
import { PaymentScreen } from '@/features/checkout/PaymentScreen';
import { ReviewScreen } from '@/features/checkout/ReviewScreen';
import { ShippingScreen } from '@/features/checkout/ShippingScreen';
import { HomeScreen } from '@/features/home/HomeScreen';
import { OrderDetailsScreen } from '@/features/orders/OrderDetailsScreen';
import { OrdersScreen } from '@/features/orders/OrdersScreen';
import { ProductDetailsScreen } from '@/features/catalog/ProductDetailsScreen';
import { ShopScreen } from '@/features/catalog/ShopScreen';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'System4 Mobile', animation: 'none' }}
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Shop" component={ShopScreen} options={{ animation: 'none' }} />
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetailsScreen}
          options={{ title: 'Product' }}
        />
        <Stack.Screen name="Cart" component={CartScreen} options={{ animation: 'none' }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Shipping" component={ShippingScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} options={{ animation: 'none' }} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="Account" component={AccountScreen} options={{ animation: 'none' }} />
        <Stack.Screen name="AccountProfile" component={AccountProfileScreen} />
        <Stack.Screen name="AccountAddresses" component={AccountAddressesScreen} />
        <Stack.Screen name="AccountAddressForm" component={AccountAddressFormScreen} />
        <Stack.Screen name="AccountOrderHistory" component={AccountOrderHistoryScreen} />
        <Stack.Screen
          name="AccountRefundRequests"
          component={AccountRefundRequestsScreen}
        />
        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
