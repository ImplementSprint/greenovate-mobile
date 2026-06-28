# System4 Mobile App Guide

This document describes how to build the MobileSystem4 app using the existing `C:\UST_VALENTON\OOS1\System4` frontend and backend as the source of truth.

MobileSystem4 should remain an Expo + TypeScript mobile app that follows this repository's README:

- Expo SDK 55
- React Native 0.83
- Strict TypeScript
- React Navigation native stack
- Jest unit tests in `tests/unit`
- Maestro flows in `.maestro`
- Runtime config through `src/config/appConfig.ts`

System4 provides the product behavior, API surface, business rules, and environment values that the mobile app should adapt.

## Source Systems

### Mobile Template

Path:

```text
C:\UST_VALENTON\OOS1\MobileSystem4
```

Use this repository for:

- Mobile app structure
- Expo configuration
- Native build commands
- Mobile CI expectations
- Unit and Maestro test locations
- Runtime config pattern

### Web Frontend Basis

Path:

```text
C:\UST_VALENTON\OOS1\System4\nexOOS
```

System4 frontend is a Next.js app named `nexoos-frontend`.

Use it as the basis for:

- login/signup
- Customer shopping flows
- Authentication screens and behavior
- Product catalog browsing
- Product search and suggestions
- Cart behavior
- Checkout flow
- Order tracking
- Return request flows
- Account/profile flows
- Branch and delivery UX


Important frontend files and areas:

```text
nexOOS/src/components/Home.tsx
nexOOS/src/components/Shop.tsx
nexOOS/src/components/ProductDetailsModal.tsx
nexOOS/src/components/CartDrawer.tsx
nexOOS/src/components/Checkout.tsx
nexOOS/src/components/Login.tsx
nexOOS/src/components/Register.tsx
nexOOS/src/components/Account.tsx
nexOOS/src/components/OrderStatus.tsx
nexOOS/src/context/AppContext.tsx
nexOOS/src/lib/api.ts
nexOOS/src/lib/auth-client.ts
nexOOS/src/lib/backend-proxy.ts
nexOOS/src/lib/product-catalog.ts
nexOOS/src/lib/customer-addresses.ts
nexOOS/src/lib/promo.ts
nexOOS/src/lib/philippine-locations.ts
```

The Next.js API routes under `nexOOS/src/app/api` are also useful for understanding current request and response shapes, especially where the web frontend proxies requests to the backend.

### Backend Basis

Path:

```text
C:\UST_VALENTON\OOS1\System4\greenovate-be
```

System4 backend is a NestJS microservices backend named `pharmaquick-backend`.

Use it as the source of truth for:

- API gateway URL and route behavior
- Authentication
- Catalog data
- Cart data
- Orders
- Promotions
- Delivery/address validation
- Analytics/search tracking
- Service-specific environment requirements

Backend services:

```text
greenovate-be/api-gateway
greenovate-be/auth-service
greenovate-be/catalog-service
greenovate-be/cart-service
greenovate-be/order-service
greenovate-be/promo-service
greenovate-be/delivery-service
greenovate-be/analytics-service
```

The API gateway is the mobile app's preferred integration point. For local development, the backend README describes the public API entrypoint as:

```text
http://localhost:4000/api
```

## Mobile App Goal

Build a native mobile version of the System4 PharmaQuick/nexOOS experience.

The first mobile version should prioritize customer workflows:

1. Register and log in
2. Browse products
3. Search products
4. View product details
5. Add items to cart
6. Manage cart quantities
7. Checkout
8. Track orders
9. View account/profile details
10. Request returns, if supported by the backend contract

Admin workflows can be added later unless the project specifically requires mobile admin support.

## Proposed Mobile Structure

Keep the repository structure from the MobileSystem4 README:

```text
src/
  app/
  config/
  features/
  navigation/
  theme/
  utils/
tests/
  unit/
.maestro/
```

Recommended feature folders:

```text
src/features/auth/
src/features/catalog/
src/features/cart/
src/features/checkout/
src/features/orders/
src/features/account/
src/features/branches/
src/features/delivery/
src/features/promos/
```

Recommended shared utilities:

```text
src/utils/apiClient.ts
src/utils/storage.ts
src/utils/validation.ts
src/config/appConfig.ts
```

Recommended navigation:

```text
src/navigation/RootNavigator.tsx
src/navigation/AuthNavigator.tsx
src/navigation/MainTabs.tsx
src/navigation/ShopStack.tsx
src/navigation/AccountStack.tsx
```

## Web-To-Mobile Mapping

Use the existing web frontend as the functional reference, but rebuild UI with React Native components.

| Web source | Mobile equivalent |
|---|---|
| `Home.tsx` | Home screen |
| `Shop.tsx` | Product listing screen |
| `ProductDetailsModal.tsx` | Product details screen or native modal |
| `CartDrawer.tsx` | Cart screen or bottom sheet |
| `Checkout.tsx` | Checkout stack |
| `Login.tsx` | Login screen |
| `Register.tsx` | Register screen |
| `Account.tsx` | Account/profile screen |
| `OrderStatus.tsx` | Order tracking screen |
| `BranchModal.tsx` | Branch selector screen/modal |
| `AppContext.tsx` | Mobile state providers or feature stores |

Do not copy DOM-specific code directly. Convert:

- HTML elements to React Native primitives
- CSS/Tailwind styling to `StyleSheet` or the project's chosen theme system
- Browser storage to mobile storage
- Web-only routing to React Navigation
- Web modals/drawers to native screens, native modals, or bottom sheets

## API Integration

MobileSystem4 should call the System4 backend through the API gateway where possible.

Local backend command from System4 root:

```bash
npm run dev:backend
```

Local frontend command, useful for behavior comparison:

```bash
npm run dev:frontend
```

Full System4 command:

```bash
npm run dev
```

Mobile runtime config should use `src/config/appConfig.ts`.

Recommended mobile environment variable:

```text
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

For Android emulator local development, `localhost` usually points to the emulator itself. Use this instead when needed:

```text
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:4000/api
```

For a physical device, use the development machine's LAN IP:

```text
EXPO_PUBLIC_API_BASE_URL=http://<your-computer-lan-ip>:4000/api
```

## Environment Values

System4 frontend uses these key environment variables:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
BACKEND_PROXY_BASE_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SECOND_SUPABASE_URL=
NEXT_PUBLIC_SECOND_SUPABASE_ANON_KEY=your_second_supabase_anon_key
SECOND_SUPABASE_URL=
SECOND_SUPABASE_ANON_KEY=your_second_supabase_anon_key
SECOND_SUPABASE_SERVICE_ROLE_KEY=your_second_supabase_service_role_key
JWT_SECRET=change_me_jwt_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAIL_USER=
MAIL_PASS=
GOOGLE_GENAI_API_KEY=
```

Mobile should not expose server-only secrets such as service role keys, mail credentials, or JWT secrets. Keep mobile public configuration limited to values that are safe on a client device.

Mobile-safe examples:

```text
EXPO_PUBLIC_APP_NAME=
EXPO_PUBLIC_APP_ENV=
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Server-only values must stay in System4 backend env files.

## Authentication

Base mobile auth behavior on:

```text
nexOOS/src/components/Login.tsx
nexOOS/src/components/Register.tsx
nexOOS/src/lib/auth-client.ts
nexOOS/src/app/api/auth/*
greenovate-be/auth-service
```

Mobile implementation notes:

- Store access tokens securely using a mobile-safe storage mechanism.
- Keep refresh/session behavior aligned with the backend.
- Avoid storing passwords, service keys, or JWT secrets on device.
- Add logout behavior that clears local session state.
- Add tests for successful login, failed login, registration validation, and logout.

## Catalog And Search

Base mobile catalog behavior on:

```text
nexOOS/src/components/Shop.tsx
nexOOS/src/components/ProductDetailsModal.tsx
nexOOS/src/lib/product-catalog.ts
nexOOS/src/app/api/products/*
nexOOS/src/app/api/products/search/route.ts
nexOOS/src/app/api/products/suggestions/route.ts
greenovate-be/catalog-service
greenovate-be/analytics-service
```

Mobile screens:

- Product list
- Category filters
- Product search
- Product details
- Recommendations, if exposed by the backend

## Cart And Checkout

Base mobile cart and checkout behavior on:

```text
nexOOS/src/components/CartDrawer.tsx
nexOOS/src/components/Checkout.tsx
nexOOS/src/app/api/cart/route.ts
nexOOS/src/app/api/orders/place/route.ts
greenovate-be/cart-service
greenovate-be/order-service
```

Mobile screens:

- Cart
- Checkout details
- Delivery/address selection
- Promo validation
- Order confirmation

## Orders And Returns

Base mobile order behavior on:

```text
nexOOS/src/components/OrderStatus.tsx
nexOOS/src/app/api/orders/my/route.ts
nexOOS/src/app/api/orders/track/route.ts
nexOOS/src/app/api/orders/cancel/route.ts
nexOOS/src/app/api/orders/return-request/route.ts
nexOOS/src/app/api/orders/my-return-requests/route.ts
greenovate-be/order-service
```

Mobile screens:

- My orders
- Order details
- Track order
- Cancel order
- Return request
- Return request status

## Delivery And Locations

Base mobile delivery behavior on:

```text
nexOOS/src/hooks/usePhilippineLocations.ts
nexOOS/src/lib/customer-addresses.ts
nexOOS/src/lib/philippine-locations.ts
nexOOS/src/app/api/delivery/*
nexOOS/src/app/api/locations/route.ts
greenovate-be/delivery-service
```

Mobile screens:

- Saved addresses
- Address form
- Delivery estimate
- Branch selection

## Promotions

Base mobile promo behavior on:

```text
nexOOS/src/lib/promo.ts
nexOOS/src/app/api/promos/validate/route.ts
greenovate-be/promo-service
```

Mobile behavior:

- Promo code entry during checkout
- Promo validation
- Discount display
- Clear validation errors when cart contents change

## Testing Plan

Follow MobileSystem4's test conventions.

Unit tests should go in:

```text
tests/unit/
```

Recommended unit coverage:

- Config resolution in `src/config/appConfig.ts`
- API client base URL handling
- Auth state transitions
- Cart totals and quantity updates
- Checkout validation
- Order status formatting

Maestro flows should go in:

```text
.maestro/
```

Recommended smoke flows:

- App launches successfully
- Login screen loads
- Product list loads
- Search returns results
- Add to cart works
- Cart screen opens
- Checkout screen validates required fields

Run MobileSystem4 verification with:

```bash
npm run verify
npm run maestro:validate
```

Run platform smoke tests when devices/simulators are available:

```bash
npm run maestro:test:android
npm run maestro:test:ios
```

## Implementation Checklist

1. Confirm backend is running from `C:\UST_VALENTON\OOS1\System4`.
2. Set `EXPO_PUBLIC_API_BASE_URL` in MobileSystem4.
3. Create a shared mobile API client.
4. Port auth screens and behavior from `nexOOS`.
5. Port catalog/product search behavior.
6. Port cart behavior.
7. Port checkout/order creation behavior.
8. Port order tracking and order history.
9. Add account/profile screens.
10. Add delivery/address flows.
11. Add focused unit tests.
12. Add Maestro smoke flows.
13. Run `npm run verify`.
14. Run Android/iOS smoke tests.

## CI Notes

Keep the MobileSystem4 CI expectations from the README.

Required repository variable:

```text
MOBILE_SINGLE_SYSTEMS_JSON
```

Recommended value:

```json
{
  "name": "mobile-expo",
  "dir": ".",
  "mobile_stack": "expo",
  "enable_android_build": true,
  "enable_ios_build": true,
  "version_stream": "mobile-expo"
}
```

The mobile app must remain TypeScript-only with strict mode enabled.

## Important Boundaries

MobileSystem4 should not directly copy:

- Next.js route handlers as mobile code
- Browser-only APIs
- Server-only secrets
- Supabase service role keys
- Mail credentials
- Backend JWT secrets

MobileSystem4 should reuse:

- System4 user flows
- API contracts
- Validation behavior
- Product/order/cart concepts
- Backend gateway as the integration point
- MobileSystem4 Expo, CI, test, and navigation conventions
