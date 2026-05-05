# React Native Implementation Plan
## Kairo (EVChargeFinder) — Frontend Build Specification

---

| Field | Details |
|---|---|
| **Document Version** | v1.0 |
| **App Name** | Kairo |
| **Status** | Draft |
| **Author** | Shubhranshu Das (Reesh) |
| **Date** | April 2026 |
| **Reference Docs** | PRD_EVChargeFinder v1.0 · HLD_TRD v1.0 · API_SPEC v1.0 · endpoints.md |
| **Backend Base URL (Dev)** | `http://localhost:8000/v1` |
| **Backend Base URL (Prod)** | `https://api.evchargefinder.in/v1` |

---

## Table of Contents

1. [Phase Overview](#1-phase-overview)
2. [Phase 1 — Project Scaffold & Architecture](#2-phase-1--project-scaffold--architecture)
3. [Phase 2 — Design System & Token Library](#3-phase-2--design-system--token-library)
4. [Phase 3 — Authentication Flow (OTP)](#4-phase-3--authentication-flow-otp)
5. [Phase 4 — Core Navigation Shell](#5-phase-4--core-navigation-shell)
6. [Phase 5 — Station Discovery (Map View)](#6-phase-5--station-discovery-map-view)
7. [Phase 6 — Station Detail & Slot Selection](#7-phase-6--station-detail--slot-selection)
8. [Phase 7 — Booking Engine (Frontend)](#8-phase-7--booking-engine-frontend)
9. [Phase 8 — Payment Integration (Razorpay)](#9-phase-8--payment-integration-razorpay)
10. [Phase 9 — Real-Time Layer (WebSocket + Supabase)](#10-phase-9--real-time-layer-websocket--supabase)
11. [Phase 10 — Notifications System](#11-phase-10--notifications-system)
12. [Phase 11 — Reviews & Route Planner](#12-phase-11--reviews--route-planner)
13. [Phase 12 — Demand Forecast & Surge Pricing UI](#13-phase-12--demand-forecast--surge-pricing-ui)
14. [Phase 13 — Polish, Animations & Micro-Interactions](#14-phase-13--polish-animations--micro-interactions)
15. [Phase 14 — Testing & Production Hardening](#15-phase-14--testing--production-hardening)
16. [Cross-Cutting Concerns](#16-cross-cutting-concerns)
17. [Master Screen Inventory](#17-master-screen-inventory)
18. [State Architecture Reference](#18-state-architecture-reference)

---

## 1. Phase Overview

| Phase | Name | Duration | Primary Endpoints |
|---|---|---|---|
| **1** | Project Scaffold & Architecture | 3 days | None — tooling only |
| **2** | Design System & Token Library | 2 days | None — UI primitives |
| **3** | Authentication Flow | 3 days | `POST /auth/otp/send` · `POST /auth/otp/verify` · `POST /auth/token/refresh` · `GET /auth/me` |
| **4** | Core Navigation Shell | 2 days | `GET /auth/me` · `GET /notifications` |
| **5** | Station Discovery — Map View | 4 days | `GET /stations/nearby` |
| **6** | Station Detail & Slot Selection | 4 days | `GET /stations/{id}` · `GET /slots/stations/{id}` · `GET /slots/{slot_id}` |
| **7** | Booking Engine | 4 days | `POST /bookings` · `GET /bookings` · `DELETE /bookings/{id}` |
| **8** | Payment Integration | 3 days | `POST /payments/verify` · `POST /payments/webhook` |
| **9** | Real-Time Layer | 3 days | WebSocket · Supabase Realtime |
| **10** | Notifications System | 2 days | `GET /notifications` · `POST /notifications/{id}/read` · `POST /notifications/read-all` |
| **11** | Reviews & Route Planner | 3 days | `POST /reviews` · `GET /reviews/stations/{id}` · `POST /routes/plan` |
| **12** | Demand Forecast & Surge Pricing UI | 2 days | `GET /demand/predict/{station_id}` · `GET /demand/pricing/{station_id}` |
| **13** | Polish, Animations & Micro-Interactions | 3 days | None — UX layer |
| **14** | Testing & Production Hardening | 4 days | All endpoints — integration tests |

**Total: ~42 development days (~8.5 weeks with buffer)**

---

## 2. Phase 1 — Project Scaffold & Architecture

**Duration:** 3 days
**Goal:** Bootstrap a production-grade Expo project with TypeScript, structured folders, environment management, API client, and CI.

### 1.1 Tech Stack Decisions

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Expo SDK 51 + React Native 0.74 | Managed workflow, OTA updates via EAS |
| Language | TypeScript 5 (strict mode) | Type safety, self-documenting API contracts |
| Routing | Expo Router v3 (file-based) | Nested layouts, deep linking, web parity |
| Server State | TanStack Query v5 | Caching, background refetch, optimistic updates |
| Client State | Zustand + MMKV persist | Lightweight, no boilerplate, fast native storage |
| HTTP Client | Axios with interceptor chain | JWT inject, token refresh, request logging |
| Forms | React Hook Form + Zod | Schema-driven validation matching API error codes |
| Maps | `react-native-maps` + Google Maps SDK | PostGIS-native, supports custom markers |
| Payments | `react-native-razorpay` | Official Razorpay RN SDK |
| Push Notifications | Notifee + Expo Notifications | Foreground/background handling, channels |
| Animations | Reanimated 3 + Moti | Worklet-based, 60fps on the JS thread |
| Storage | MMKV via `react-native-mmkv` | 10x faster than AsyncStorage for token caching |
| WebSocket | Native WebSocket API | Backend exposes standard WS endpoint |
| Icons | `@expo/vector-icons` (MaterialCommunityIcons) | EV-specific icon coverage |
| Linting | ESLint + Prettier + `typescript-eslint` | Strict rules, consistent formatting |

### 1.2 Project Structure

```
kairo/
├── app/                              ← Expo Router file-based pages
│   ├── _layout.tsx                   ← Root layout (providers, fonts)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx                 ← Phone entry
│   │   └── otp.tsx                   ← OTP verify
│   ├── (app)/
│   │   ├── _layout.tsx               ← Tab navigator
│   │   ├── index.tsx                 ← Map / Discover (home tab)
│   │   ├── bookings.tsx              ← My Bookings tab
│   │   ├── notifications.tsx         ← Notifications tab
│   │   └── profile.tsx               ← Profile tab
│   ├── station/
│   │   ├── [id].tsx                  ← Station detail
│   │   └── [id]/slots.tsx            ← Slot picker (modal)
│   ├── booking/
│   │   ├── confirm.tsx               ← Booking confirmation
│   │   └── [id].tsx                  ← Booking detail
│   ├── route-planner.tsx             ← Route planner screen
│   └── +not-found.tsx
│
├── src/
│   ├── api/
│   │   ├── client.ts                 ← Axios instance, interceptors
│   │   ├── auth.ts                   ← Auth API functions
│   │   ├── stations.ts
│   │   ├── slots.ts
│   │   ├── bookings.ts
│   │   ├── payments.ts
│   │   ├── notifications.ts
│   │   ├── reviews.ts
│   │   ├── routes.ts
│   │   └── demand.ts
│   │
│   ├── hooks/
│   │   ├── useNearbyStations.ts
│   │   ├── useStationDetail.ts
│   │   ├── useSlots.ts
│   │   ├── useBookings.ts
│   │   ├── useNotifications.ts
│   │   ├── useLocation.ts
│   │   ├── useWebSocket.ts
│   │   └── useRazorpay.ts
│   │
│   ├── store/
│   │   ├── auth.store.ts             ← Tokens, user object
│   │   ├── map.store.ts              ← Viewport, selected marker
│   │   ├── booking.store.ts          ← Draft booking in progress
│   │   └── ui.store.ts               ← Toasts, modals, loading flags
│   │
│   ├── components/
│   │   ├── ui/                       ← Primitives (Button, Input, Badge)
│   │   ├── map/                      ← StationMarker, MapSheet, FiltersBar
│   │   ├── station/                  ← StationCard, ConnectorBadge, RatingRow
│   │   ├── booking/                  ← SlotCard, TimePicker, BookingSummary
│   │   ├── payment/                  ← PaymentSheet, OrderSummary
│   │   └── common/                   ← LoadingOverlay, ErrorBoundary, EmptyState
│   │
│   ├── constants/
│   │   ├── colors.ts                 ← Design token palette
│   │   ├── typography.ts             ← Font scale
│   │   ├── spacing.ts                ← 8pt grid
│   │   ├── routes.ts                 ← Route string constants
│   │   └── errors.ts                 ← API error code enum
│   │
│   ├── types/
│   │   ├── api.types.ts              ← ResponseEnvelope<T>, PaginatedResponse<T>
│   │   ├── auth.types.ts
│   │   ├── station.types.ts
│   │   ├── booking.types.ts
│   │   ├── slot.types.ts
│   │   ├── payment.types.ts
│   │   └── notification.types.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts             ← Currency, distance, duration
│   │   ├── validators.ts             ← Phone regex, OTP validation
│   │   ├── geo.ts                    ← Coord helpers, distance calc
│   │   └── idempotency.ts            ← UUID v4 key generator
│   │
│   └── providers/
│       ├── QueryProvider.tsx
│       ├── AuthProvider.tsx
│       └── NotificationProvider.tsx
│
├── assets/
│   ├── fonts/                        ← Poppins (300–700 weights)
│   ├── images/
│   └── icons/
│
├── .env.development
├── .env.staging
├── .env.production
├── app.config.ts                     ← Dynamic Expo config (reads .env)
├── eas.json
├── tsconfig.json
└── package.json
```

### 1.3 API Client with Token Refresh

```typescript
// src/api/client.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { MMKV } from 'react-native-mmkv';
import { v4 as uuidv4 } from 'uuid';

const storage = new MMKV({ id: 'kairo-auth' });

const client: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': process.env.EXPO_PUBLIC_APP_VERSION ?? '1.0.0',
    'Accept-Language': 'en-IN',
  },
});

// REQUEST — inject JWT
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storage.getString('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Auto-attach idempotency key for mutating requests
  if (['post', 'delete'].includes(config.method ?? '')) {
    config.headers['Idempotency-Key'] = uuidv4();
  }

  return config;
});

// RESPONSE — silent token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = storage.getString('refresh_token');
        const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/token/refresh`, {
          refresh_token: refreshToken,
        });

        const newToken = data.data.access_token;
        storage.set('access_token', newToken);

        failedQueue.forEach(({ resolve }) => resolve(newToken));
        failedQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        failedQueue.forEach(({ reject }) => reject(refreshError));
        failedQueue = [];
        storage.clearAll(); // Force logout
        // Navigate to auth — handled by AuthProvider listener
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
```

### 1.4 Environment Configuration

```typescript
// app.config.ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Kairo',
  slug: 'kairo-evcharge',
  version: '1.0.0',
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    googleMapsKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
    razorpayKeyId: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
  plugins: [
    'expo-router',
    'expo-location',
    ['react-native-maps', { googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY }],
  ],
});
```

### 1.5 CI Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: Kairo CI
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
```

**Deliverable:** Working Expo project boots in Expo Go. TypeScript compiles with zero errors. API client sends requests with correct headers. Lint passes on pre-commit.

---

## 3. Phase 2 — Design System & Token Library

**Duration:** 2 days
**Goal:** Implement the full Kairo design system as typed TypeScript constants and reusable primitive components. Every UI element in every future phase builds on this foundation.

### 2.1 Color Tokens

```typescript
// src/constants/colors.ts
export const Colors = {
  // Brand palette — from Kairo style guide (Poppins + green system)
  brand: {
    mintWhite:   '#EAF9E7',   // Background surfaces, tinted base
    lightGreen:  '#C0E6BA',   // Borders, inactive states, secondary fills
    primary:     '#4CA771',   // Primary actions, active state, CTAs
    dark:        '#013237',   // Text, headers, dark fills
  },

  // Semantic
  success:   '#4CA771',
  warning:   '#F59E0B',
  error:     '#EF4444',
  info:      '#3B82F6',

  // Neutrals
  white:        '#FFFFFF',
  surface:      '#F8FFF8',    // Cards on mint background
  border:       '#C0E6BA',
  borderLight:  'rgba(192, 230, 186, 0.4)',
  text: {
    primary:    '#013237',
    secondary:  'rgba(1, 50, 55, 0.65)',
    tertiary:   'rgba(1, 50, 55, 0.40)',
    onDark:     '#FFFFFF',
    onDarkMuted:'rgba(255, 255, 255, 0.6)',
  },

  // Charger type pills
  charger: {
    ccs2:       '#4CA771',
    chademo:    '#3B82F6',
    type2:      '#8B5CF6',
    bharat:     '#F59E0B',
  },

  // Booking status
  status: {
    confirmed:  '#4CA771',
    pending:    '#F59E0B',
    cancelled:  '#EF4444',
    completed:  '#013237',
    inProgress: '#3B82F6',
  },

  // Map overlays
  map: {
    markerAvailable:   '#4CA771',
    markerFull:        '#EF4444',
    markerLow:         '#F59E0B',
    markerSelected:    '#013237',
    radiusOverlay:     'rgba(76, 167, 113, 0.12)',
  },
} as const;

export type ColorToken = typeof Colors;
```

### 2.2 Typography Scale

```typescript
// src/constants/typography.ts
import { Platform } from 'react-native';

export const FontFamily = {
  thin:       'Poppins_300Light',
  regular:    'Poppins_400Regular',
  medium:     'Poppins_500Medium',
  semiBold:   'Poppins_600SemiBold',
  bold:       'Poppins_700Bold',
} as const;

export const Typography = {
  // Display
  hero:        { fontSize: 32, fontFamily: FontFamily.bold,     lineHeight: 40,  letterSpacing: -0.5 },
  h1:          { fontSize: 26, fontFamily: FontFamily.bold,     lineHeight: 34,  letterSpacing: -0.3 },
  h2:          { fontSize: 22, fontFamily: FontFamily.semiBold, lineHeight: 30,  letterSpacing: -0.2 },
  h3:          { fontSize: 18, fontFamily: FontFamily.semiBold, lineHeight: 26 },
  h4:          { fontSize: 16, fontFamily: FontFamily.semiBold, lineHeight: 24 },

  // Body
  bodyLarge:   { fontSize: 16, fontFamily: FontFamily.regular,  lineHeight: 26 },
  body:        { fontSize: 14, fontFamily: FontFamily.regular,  lineHeight: 22 },
  bodySmall:   { fontSize: 12, fontFamily: FontFamily.regular,  lineHeight: 18 },

  // UI
  label:       { fontSize: 13, fontFamily: FontFamily.medium,   lineHeight: 20 },
  labelSmall:  { fontSize: 11, fontFamily: FontFamily.medium,   lineHeight: 16, letterSpacing: 0.5 },
  caption:     { fontSize: 11, fontFamily: FontFamily.regular,  lineHeight: 16 },
  button:      { fontSize: 15, fontFamily: FontFamily.semiBold, lineHeight: 22 },
  buttonSmall: { fontSize: 13, fontFamily: FontFamily.semiBold, lineHeight: 18 },
  mono:        { fontSize: 13, fontFamily: Platform.select({ ios: 'Courier New', android: 'monospace' }), lineHeight: 20 },
} as const;
```

### 2.3 Spacing System

```typescript
// src/constants/spacing.ts
// 8pt grid
export const Spacing = {
  xs:   4,
  sm:   8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const Radius = {
  sm:   6,
  md:  10,
  lg:  16,
  xl:  24,
  pill: 999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#013237',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#013237',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#013237',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;
```

### 2.4 Primitive Components to Build

```
src/components/ui/
├── Button.tsx            ← variant: primary | secondary | ghost | danger
│                            size: sm | md | lg
│                            loading state with ActivityIndicator
│
├── Input.tsx             ← variant: default | otp-digit
│                            left/right icon slots
│                            error message display
│
├── Badge.tsx             ← ChargerType pill, BookingStatus pill
│
├── Card.tsx              ← Elevated surface with shadow token
│
├── BottomSheet.tsx       ← Reanimated3 draggable sheet
│                            snap points: 40% | 70% | 95%
│
├── Skeleton.tsx          ← Shimmer loading placeholder
│
├── Toast.tsx             ← success | error | warning | info variants
│                            auto-dismiss after 3s
│
├── EmptyState.tsx        ← Illustration + message + optional CTA
│
├── LoadingOverlay.tsx    ← Full-screen or inline loading
│
├── Divider.tsx
├── Avatar.tsx            ← Initials fallback
└── Chip.tsx              ← Filter chip with toggle state
```

### 2.5 Button Component (reference implementation)

```typescript
// src/components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '@/constants';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false, style,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? Colors.brand.white : Colors.brand.primary} size="small" />
        : <Text style={[styles.label, styles[`label_${variant}`], styles[`labelSize_${size}`]]}>{label}</Text>
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: Radius.pill },
  primary:   { backgroundColor: Colors.brand.primary },
  secondary: { backgroundColor: Colors.brand.mintWhite, borderWidth: 1.5, borderColor: Colors.brand.primary },
  ghost:     { backgroundColor: 'transparent' },
  danger:    { backgroundColor: Colors.error },
  size_sm:   { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, minHeight: 36 },
  size_md:   { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, minHeight: 48 },
  size_lg:   { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, minHeight: 56 },
  fullWidth: { width: '100%' },
  disabled:  { opacity: 0.45 },
  label:           { ...Typography.button },
  label_primary:   { color: Colors.white },
  label_secondary: { color: Colors.brand.primary },
  label_ghost:     { color: Colors.brand.primary },
  label_danger:    { color: Colors.white },
  labelSize_sm:    { fontSize: 13 },
  labelSize_md:    { fontSize: 15 },
  labelSize_lg:    { fontSize: 16 },
});
```

**Deliverable:** Storybook-equivalent component gallery screen. All primitives render correctly with Kairo brand tokens applied.

---

## 4. Phase 3 — Authentication Flow (OTP)

**Duration:** 3 days
**Endpoints:** `POST /v1/auth/otp/send` · `POST /v1/auth/otp/verify` · `POST /v1/auth/token/refresh` · `GET /v1/auth/me` · `DELETE /v1/auth/logout`

### 3.1 Screen Flow

```
Splash Screen (2s)
    ↓
PhoneScreen (/auth)
  → User enters +91 phone number
  → Validates regex: /^\+91[6-9]\d{9}$/
  → POST /auth/otp/send
  → On success → navigate to OTPScreen
    ↓
OTPScreen (/auth/otp)
  → 6-box auto-advance OTP input
  → 5-minute countdown timer with resend
  → POST /auth/otp/verify
  → On is_new_user=true → ProfileSetupScreen
  → On is_new_user=false → Main App
    ↓
ProfileSetupScreen (first-time only)
  → Name, email (optional), vehicle type, preferred connector
  → PATCH /auth/me
    ↓
Main App → (app)/_layout.tsx (Tab Navigator)
```

### 3.2 Auth Store

```typescript
// src/store/auth.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'kairo-auth' });

const mmkvStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};

interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: 'user' | 'admin';
  vehicle_type: string | null;
  preferred_connector: string | null;
  expo_push_token: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    { name: 'kairo-auth', storage: createJSONStorage(() => mmkvStorage) }
  )
);
```

### 3.3 OTP Input Component

```typescript
// src/components/auth/OTPInput.tsx
// 6 individual TextInput boxes, each 1 character wide
// Auto-advance to next box on input
// Auto-back to previous box on backspace
// Auto-submit when all 6 digits filled
// Paste support: spread pasted 6-digit string across boxes
// Error state: shake animation + red border via Reanimated
```

### 3.4 API Hooks

```typescript
// src/api/auth.ts

// POST /auth/otp/send
export const sendOtp = (phone: string) =>
  client.post('/auth/otp/send', { phone });

// POST /auth/otp/verify
export const verifyOtp = (phone: string, otp: string) =>
  client.post<ApiResponse<VerifyOtpResponse>>('/auth/otp/verify', { phone, otp });

// GET /auth/me
export const getMe = () =>
  client.get<ApiResponse<User>>('/auth/me');

// DELETE /auth/logout
export const logout = () =>
  client.delete('/auth/logout');
```

### 3.5 Error Handling Map

| API Error Code | UI Response |
|---|---|
| `OTP_LIMIT_EXCEEDED` | Show retry_after_seconds countdown on resend button |
| `INVALID_OTP` | Shake OTP boxes, show "Invalid OTP — X attempts remaining" |
| `TOKEN_EXPIRED` | Silent refresh via interceptor, transparent to user |
| `UNAUTHORIZED` | Clear store, push to auth stack |

**Deliverable:** Full OTP auth flow functional end-to-end. Tokens persisted to MMKV. Silent refresh working. Logout clears storage.

---

## 5. Phase 4 — Core Navigation Shell

**Duration:** 2 days
**Goal:** Build the tab navigator layout, header, and the global UI shell that wraps all authenticated screens.

### 4.1 Tab Structure

```typescript
// app/(app)/_layout.tsx  — 4 tabs
tabs = [
  { name: 'index',         title: 'Discover',       icon: 'map-marker-radius' },
  { name: 'bookings',      title: 'Bookings',        icon: 'calendar-check' },
  { name: 'notifications', title: 'Alerts',          icon: 'bell-outline', badge: unreadCount },
  { name: 'profile',       title: 'Profile',         icon: 'account-circle-outline' },
]
```

### 4.2 Tab Bar Design

```
Color scheme:
  - Active tab icon + label:  Colors.brand.primary (#4CA771)
  - Inactive tab icon + label: Colors.brand.dark at 40% opacity
  - Tab bar background:        Colors.white
  - Tab bar border-top:        Colors.brand.lightGreen
  - Notification badge:        Colors.error, white text

Custom tab bar component:
  - Haptic feedback: Haptics.impactAsync(ImpactFeedbackStyle.Light)
  - Animated scale: active icon scales 1.0 → 1.1 on press
```

### 4.3 Header Component

```typescript
// src/components/common/AppHeader.tsx
// Left: Kairo logo (SVG wordmark) or back chevron
// Right: notification bell with unread badge
// Background: white with bottom border lightGreen
// Uses useNotifications hook to show live unread count
```

### 4.4 Auth Guard

```typescript
// app/_layout.tsx
// AuthProvider listens to useAuthStore.isAuthenticated
// If false → redirect to /(auth)/index
// If true → redirect to /(app)/index
// Handles deep links on cold start
```

**Deliverable:** Full tab navigation working. Back navigation functional. Notification badge updates live. Auth guard redirecting correctly.

---

## 6. Phase 5 — Station Discovery (Map View)

**Duration:** 4 days
**Endpoint:** `GET /v1/stations/nearby?lat=&lng=&radius_km=&charger_type=&available_only=&limit=&offset=`

### 5.1 Screen Anatomy

```
┌────────────────────────────────────┐
│  Search bar + Filters row          │  ← Fixed top
├────────────────────────────────────┤
│                                    │
│          react-native-maps         │
│      (MapView fills screen)        │
│                                    │
│  ⊙ StationMarker (green: avail)   │
│  ⊙ StationMarker (red: full)      │
│  ⊙ StationMarker (yellow: low)    │
│                                    │
│       [My Location Button]         │  ← FAB bottom-right
├────────────────────────────────────┤
│  BottomSheet (40% default snap)    │
│  ┌──────────────────────────────┐  │
│  │ Station cards horizontal     │  │  ← Synced to map selected marker
│  │ scroll (FlatList)            │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

### 5.2 Location Permission Flow

```typescript
// src/hooks/useLocation.ts
import * as Location from 'expo-location';

// 1. Request foreground permission on first app open
// 2. On granted → getCurrentPositionAsync (high accuracy)
// 3. On denied → show permission rationale bottom sheet with Settings deeplink
// 4. Watch position continuously with watchPositionAsync
// 5. Persist last known location to MMKV for offline load
```

### 5.3 Station Query Hook

```typescript
// src/hooks/useNearbyStations.ts
import { useInfiniteQuery } from '@tanstack/react-query';

export const useNearbyStations = (params: NearbyStationsParams) => {
  return useInfiniteQuery({
    queryKey: ['stations', 'nearby', params],
    queryFn: ({ pageParam = 0 }) =>
      fetchNearbyStations({ ...params, offset: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_next ? lastPage.pagination.offset + lastPage.pagination.limit : undefined,
    staleTime: 30_000,           // 30s — station list is eventually consistent
    refetchInterval: 60_000,     // Background refresh every 60s
    enabled: !!(params.lat && params.lng),
  });
};
```

### 5.4 Station Marker

```typescript
// src/components/map/StationMarker.tsx
// Custom marker using react-native-maps Marker + Callout
// Color coded:
//   available_slots > 0  → brand.primary (#4CA771)
//   available_slots === 0 → error (#EF4444)
//   available_slots === 1 → warning (#F59E0B)
// Selected state: scale 1.3, brand.dark ring
// Callout: station name, charger types, available count
// onPress: update map.store selectedStationId, scroll FlatList to card
```

### 5.5 Filter Bar

```typescript
// Filters: All | CCS2 | CHAdeMO | Type 2 | Bharat AC
// Available Only toggle switch
// Radius slider: 1km | 3km | 5km | 10km | 25km
// Active filter chips highlighted with brand.primary background
// On filter change → invalidate ['stations', 'nearby'] query
```

### 5.6 Station Card (Horizontal Scroll)

```typescript
// src/components/station/StationCard.tsx
// Width: 280px, margin: 8px
// Shows: station name, distance, available/total slots, charger types, rating
// Highlighted border when card's station is selected on map
// onPress → navigate to /station/[id]
```

### 5.7 Map Store

```typescript
// src/store/map.store.ts
interface MapState {
  region: Region;                  // Current map viewport
  userLocation: LatLng | null;
  selectedStationId: string | null;
  filters: {
    charger_type: string | null;
    available_only: boolean;
    radius_km: number;
  };
  setRegion: (region: Region) => void;
  setSelectedStation: (id: string | null) => void;
  setFilters: (filters: Partial<MapState['filters']>) => void;
}
```

**Deliverable:** Full map view with live station markers. Filters working. Bottom sheet synced with map selection. Location permission handled gracefully.

---

## 7. Phase 6 — Station Detail & Slot Selection

**Duration:** 4 days
**Endpoints:**
- `GET /v1/stations/{station_id}` — Station detail
- `GET /v1/slots/stations/{station_id}` — All slots for station
- `GET /v1/slots/{slot_id}` — Single slot detail

### 6.1 Station Detail Screen `/station/[id]`

```
┌───────────────────────────────────┐
│  Hero image (station photo)       │
│  ← Back   Share ↗                │
├───────────────────────────────────┤
│  Station name (h1)                │
│  Address · X.Xkm away            │
│  ★ 4.3 (127 reviews)             │
│  ──────────────────────────────── │
│  CHARGER TYPES                    │
│  [CCS2] [Type 2] [CHAdeMO]       │
│  ──────────────────────────────── │
│  AVAILABILITY                     │
│  ●●●○○  3 of 5 available         │
│  ──────────────────────────────── │
│  PRICING                          │
│  ₹8.50/kWh · ₹2.00/min idle     │
│  ──────────────────────────────── │
│  OPERATING HOURS                  │
│  Mon–Sun · 6:00 AM – 11:00 PM   │
│  ──────────────────────────────── │
│  [View on Google Maps] →         │
│  [View Demand Forecast] →        │
│  ──────────────────────────────── │
│  RECENT REVIEWS                   │
│  (top 3, "See all" link)         │
├───────────────────────────────────┤
│  [ ₹8.50/kWh    Book a Slot → ]  │  ← Sticky bottom CTA
└───────────────────────────────────┘
```

### 6.2 Navigation Handoff

```typescript
// "View on Google Maps" button
const openMaps = (station: Station) => {
  const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
  const url = Platform.OS === 'ios'
    ? `maps://?daddr=${station.lat},${station.lng}`
    : `geo:${station.lat},${station.lng}?q=${encodeURIComponent(station.name)}`;
  Linking.openURL(url);
};
```

### 6.3 Slot Picker Screen `/station/[id]/slots`

```
Presented as a modal (full-screen sheet)

┌───────────────────────────────────┐
│  Select a Slot                    │
│  Station Name · Date: Today       │
├───────────────────────────────────┤
│  DATE SELECTOR                    │
│  [Mon 13] [Tue 14] [Wed 15] ...  │  ← Horizontal scroll, max 7 days ahead
├───────────────────────────────────┤
│  AVAILABLE SLOTS                  │
│  ┌──────────────────────────────┐ │
│  │ Slot A1 · CCS2 · 50kW       │ │
│  │ 09:00 – 09:45  ●Available   │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ Slot A2 · Type 2 · 22kW     │ │
│  │ 09:00 – 09:45  ○Booked      │ │  ← Greyed out, not selectable
│  └──────────────────────────────┘ │
│  ...                              │
├───────────────────────────────────┤
│  DURATION                         │
│  [30 min] [45 min] [60 min] [90] │  ← Chip selector
├───────────────────────────────────┤
│  [Confirm Slot →]                 │
└───────────────────────────────────┘
```

### 6.4 Slot Query Hook

```typescript
// src/hooks/useSlots.ts
export const useStationSlots = (stationId: string, date: string) => {
  return useQuery({
    queryKey: ['slots', stationId, date],
    queryFn: () => fetchStationSlots(stationId, { date }),
    staleTime: 10_000,         // Slots go stale fast — 10s
    refetchInterval: 15_000,   // Auto-refresh every 15s during slot selection
  });
};
```

### 6.5 Booking Draft State

```typescript
// After user selects a slot, populate booking draft in store:
// src/store/booking.store.ts
interface BookingDraft {
  stationId: string;
  stationName: string;
  slotId: string;
  slotLabel: string;          // e.g. "Slot A1"
  chargerType: string;        // e.g. "CCS2"
  scheduledStart: string;     // ISO 8601
  scheduledEnd: string;       // ISO 8601
  estimatedCost: number;      // INR
}
```

**Deliverable:** Station detail screen fully populated. Slot picker functional with date navigation. Selected slot written to booking draft store.

---

## 8. Phase 7 — Booking Engine (Frontend)

**Duration:** 4 days
**Endpoints:**
- `POST /v1/bookings` — Create booking
- `GET /v1/bookings` — List user bookings
- `DELETE /v1/bookings/{booking_id}` — Cancel booking

### 7.1 Booking Confirmation Screen `/booking/confirm`

```
Reads from booking.store draft, presents summary for final review

┌───────────────────────────────────┐
│  ← Back      Booking Summary     │
├───────────────────────────────────┤
│  STATION                          │
│  Tata Power EZ Charge, MG Road   │
│  Slot A1 · CCS2 50kW             │
│  ──────────────────────────────── │
│  DATE & TIME                      │
│  Tue, 13 May 2026                 │
│  09:00 AM → 09:45 AM (45 min)   │
│  ──────────────────────────────── │
│  COST ESTIMATE                    │
│  Energy: ₹127.50                  │
│  Surge (if any): ₹0.00           │
│  Total: ₹127.50                   │
│  ──────────────────────────────── │
│  PAYMENT                          │
│  ○ UPI  ○ Card  ○ Netbanking     │  ← Razorpay method selector
├───────────────────────────────────┤
│  [ Pay ₹127.50 via Razorpay → ]  │  ← Triggers Phase 8 flow
└───────────────────────────────────┘
```

### 7.2 Create Booking API Call

```typescript
// src/api/bookings.ts
export const createBooking = (payload: CreateBookingPayload) =>
  client.post<ApiResponse<Booking>>('/bookings', {
    slot_id: payload.slotId,
    scheduled_start: payload.scheduledStart,
    scheduled_end: payload.scheduledEnd,
    vehicle_type: payload.vehicleType,
    notes: payload.notes,
  });
// Idempotency-Key header auto-attached by axios interceptor
```

### 7.3 Bookings List Screen `/bookings`

```
Tab: [Upcoming] [In Progress] [Completed] [Cancelled]

Each booking card shows:
  - Station name + address
  - Slot, charger type, duration
  - Booking date/time
  - Status badge (color-coded)
  - Cost paid / estimated
  - [View Details] [Cancel] (if cancellable)

Pull-to-refresh → refetch query
Infinite scroll → useInfiniteQuery
```

### 7.4 Cancel Booking Flow

```typescript
// Cancellation requires confirmation:
// 1. User taps "Cancel Booking"
// 2. Bottom sheet: "Are you sure? Refunds processed in 5-7 business days"
// 3. On confirm → DELETE /bookings/{booking_id}
// 4. On API 409 BOOKING_NOT_CANCELLABLE → show specific reason
// 5. On success → optimistic update (remove from upcoming, add to cancelled)
//              → invalidate ['bookings'] query
//              → show success Toast
```

### 7.5 Booking Detail Screen `/booking/[id]`

```
Full detail view with:
  - Booking ID (styled as receipt number)
  - Station map thumbnail (static)
  - Full slot/charger breakdown
  - Payment receipt summary
  - QR code (booking ID encoded) for station check-in
  - Share button (generates text summary for WhatsApp)
  - Cancel option with eligibility check
```

**Deliverable:** Full booking CRUD functional. List with status tabs. Cancel flow with confirmation. Booking detail with QR code.

---

## 9. Phase 8 — Payment Integration (Razorpay)

**Duration:** 3 days
**Endpoints:**
- `POST /v1/payments/verify` — Verify client-side payment
- `POST /v1/payments/webhook` — (Backend only — no frontend action needed)

### 8.1 Payment Flow

```
[User taps "Pay ₹X"] 
    ↓
POST /bookings → get back booking_id + razorpay_order_id
    ↓
Open Razorpay Checkout Sheet (react-native-razorpay)
    ↓
User completes payment
    ↓
Razorpay returns: razorpay_payment_id, razorpay_order_id, razorpay_signature
    ↓
POST /payments/verify { razorpay_payment_id, razorpay_order_id, razorpay_signature, booking_id }
    ↓
Backend validates HMAC signature (dual-validation from HLD)
    ↓
On success:
  - Booking status → CONFIRMED
  - Navigate to /booking/[id] (success state)
  - Show confetti animation
  - Send push notification (backend fires)
On failure:
  - Show error bottom sheet
  - Offer retry or contact support
```

### 8.2 Razorpay Hook

```typescript
// src/hooks/useRazorpay.ts
import RazorpayCheckout from 'react-native-razorpay';
import { useAuthStore } from '@/store/auth.store';

export const useRazorpay = () => {
  const user = useAuthStore((s) => s.user);

  const openCheckout = async (orderData: RazorpayOrderData): Promise<RazorpayPaymentResult> => {
    const options = {
      key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amountPaise,       // Amount in paise
      currency: 'INR',
      name: 'Kairo',
      description: `Slot booking: ${orderData.slotLabel}`,
      order_id: orderData.razorpayOrderId,
      prefill: {
        name:    user?.name ?? '',
        email:   user?.email ?? '',
        contact: user?.phone ?? '',
      },
      theme: { color: '#4CA771' },          // Kairo brand primary
    };

    return new Promise((resolve, reject) => {
      RazorpayCheckout.open(options)
        .then(resolve)
        .catch(reject);
    });
  };

  return { openCheckout };
};
```

### 8.3 Edge Cases

| Scenario | Handling |
|---|---|
| Payment success but verify call fails | Retry verify up to 3 times with backoff; show "Verifying payment…" state |
| User closes Razorpay sheet without paying | Booking remains PENDING; show "Complete Payment" banner on bookings list |
| Razorpay timeout | Show retry sheet; PENDING booking auto-expires server-side after 10 min |
| Network lost mid-payment | Razorpay SDK queues internally; on reconnect, retry verify |
| Double-tap "Pay" | Idempotency-Key on booking POST prevents duplicate orders |

**Deliverable:** Full Razorpay payment flow working in test mode. Signature verification going through backend. Booking confirmed on success, correct error states on failure.

---

## 10. Phase 9 — Real-Time Layer (WebSocket + Supabase)

**Duration:** 3 days
**Connection:** Backend WebSocket + Supabase Realtime subscription

### 9.1 What Needs to Be Real-Time

| Data | Update Frequency | Strategy |
|---|---|---|
| Slot availability count on map markers | Every 5–10s | WebSocket push |
| Slot status in slot picker (Available/Booked) | Every 5s during active selection | WebSocket + React Query refetch |
| Active booking status (CHARGING → COMPLETED) | Change-driven | Supabase Realtime |
| Notification arrival | Immediate | Push notification (Phase 10) |

### 9.2 WebSocket Hook

```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useStationWebSocket = (stationId: string) => {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = getAccessToken(); // from MMKV
    const ws = new WebSocket(
      `${process.env.EXPO_PUBLIC_WS_URL}/ws/stations/${stationId}?token=${token}`
    );

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'slot_status_update') {
        // Patch React Query cache directly — no refetch needed
        queryClient.setQueryData(['slots', stationId], (old: SlotsResponse) =>
          patchSlotStatus(old, message.payload)
        );
      }

      if (message.type === 'station_availability_update') {
        queryClient.setQueryData(['stations', 'nearby'], (old: StationsResponse) =>
          patchStationAvailability(old, message.payload)
        );
      }
    };

    ws.onclose = () => {
      // Exponential backoff reconnect: 1s, 2s, 4s, 8s (max 30s)
      scheduleReconnect(stationId);
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [stationId]);
};
```

### 9.3 Supabase Realtime (Booking Status)

```typescript
// src/hooks/useBookingRealtime.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export const useBookingRealtime = (bookingId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`booking:${bookingId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`,
      }, (payload) => {
        // Update booking detail screen instantly
        queryClient.setQueryData(['booking', bookingId], (old: Booking) => ({
          ...old,
          status: payload.new.status,
          energy_delivered_kwh: payload.new.energy_delivered_kwh,
        }));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [bookingId]);
};
```

### 9.4 Polling Fallback

```typescript
// If WebSocket is unavailable, fall back to polling:
// React Query refetchInterval handles this transparently.
// Active station detail: refetch every 10s
// Map view: refetch every 60s
// Slot picker (during selection): refetch every 8s
// Active booking: refetch every 15s
```

**Deliverable:** Station markers update availability live. Slot picker reflects real-time booking by other users. Active booking status transitions shown instantly.

---

## 11. Phase 10 — Notifications System

**Duration:** 2 days
**Endpoints:**
- `GET /v1/notifications` — List notifications
- `POST /v1/notifications/{notification_id}/read` — Mark single read
- `POST /v1/notifications/read-all` — Mark all read

### 10.1 Push Notification Setup

```typescript
// src/providers/NotificationProvider.tsx
import * as Notifications from 'expo-notifications';
import Notifee, { AndroidImportance } from '@notifee/react-native';

// On app start:
// 1. Request notification permission
// 2. Get Expo push token
// 3. PATCH /auth/me { expo_push_token }
// 4. Set up foreground notification handler (Notifee)
// 5. Set up background/killed notification handler
// 6. Handle notification tap → deep link to relevant screen
```

### 10.2 Notification Channels (Android)

```typescript
await Notifee.createChannels([
  {
    id: 'bookings',
    name: 'Booking Updates',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  },
  {
    id: 'reminders',
    name: 'Slot Reminders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  },
  {
    id: 'promotions',
    name: 'Offers & Updates',
    importance: AndroidImportance.LOW,
  },
]);
```

### 10.3 Notification Deep Link Map

| Notification Type | Deep Link Destination |
|---|---|
| `booking_confirmed` | `/booking/[booking_id]` |
| `slot_reminder` | `/booking/[booking_id]` |
| `charging_started` | `/booking/[booking_id]` (live status) |
| `charging_completed` | `/booking/[booking_id]` (receipt) |
| `booking_cancelled` | `/bookings` |
| `slot_available` | `/station/[station_id]` |

### 10.4 Notifications Screen `/notifications`

```
Header: "Notifications" + [Mark all read] button (disabled if unread = 0)

SectionList grouped by date:
  TODAY
  ┌──────────────────────────────────────┐
  │ ● Booking Confirmed                  │  ← Unread: brand.mintWhite bg
  │   Slot A1, MG Road EZ Charge         │
  │   2 min ago                          │
  └──────────────────────────────────────┘
  ┌──────────────────────────────────────┐
  │   Charging Complete ✓                │  ← Read: white bg
  │   12.4 kWh delivered · ₹105.40      │
  │   3 hours ago                        │
  └──────────────────────────────────────┘
  YESTERDAY
  ...

Swipe-to-delete individual notification (right swipe)
Pull-to-refresh
Badge on tab icon clears after entering screen
```

**Deliverable:** Push notifications arriving in foreground and background. Deep links navigating to correct screens. Notifications list with read/unread state.

---

## 12. Phase 11 — Reviews & Route Planner

**Duration:** 3 days
**Endpoints:**
- `POST /v1/reviews` — Submit a review
- `GET /v1/reviews/stations/{station_id}?limit=&offset=` — Get reviews
- `POST /v1/routes/plan` — Plan EV-aware route

### 11.1 Review Submission Flow

```
Triggered after booking status transitions to COMPLETED:
  → Push notification: "How was your charging experience?"
  → Tap → bottom sheet overlay on booking detail screen

Bottom sheet:
  ┌──────────────────────────────────┐
  │ Rate your experience             │
  │ Station: MG Road EZ Charge       │
  │                                  │
  │  ★ ★ ★ ★ ☆   (tap to select)  │
  │                                  │
  │  [Add a comment (optional)]      │
  │  ─────────────────────────────── │
  │  Tags: [Fast Charging] [Clean]   │
  │        [Good Location] [Busy]    │
  │  ─────────────────────────────── │
  │  [ Submit Review ]               │
  └──────────────────────────────────┘

POST /reviews { station_id, booking_id, rating, comment, tags[] }
```

### 11.2 Reviews List in Station Detail

```typescript
// Paginated via offset/limit
// Top 3 shown inline in Station Detail screen
// "See all X reviews" → separate screen
// Each review card: avatar initials, rating, comment, date, vehicle type
// Sort options: Most Recent | Highest | Lowest
```

### 11.3 Route Planner Screen `/route-planner`

```
Goal: Plan a route from A → B, inserting optimal charging stops

┌───────────────────────────────────┐
│  Plan Your Route                  │
├───────────────────────────────────┤
│  FROM: [Current Location]        │
│  TO:   [Search destination]      │
│  ──────────────────────────────── │
│  Vehicle Range: [220 km]         │  ← User inputs current range
│  Current Battery: [65%]          │
│  Charger Type: [CCS2] ▾          │
│  ──────────────────────────────── │
│  [ Plan Route → ]                │
├───────────────────────────────────┤
│  SUGGESTED ROUTE (post-API call)  │
│  ──────────────────────────────── │
│  🗺 Route map (static thumbnail) │
│  Total: 340km · ~4h 20min        │
│  Charging stops: 2               │
│  ──────────────────────────────── │
│  Stop 1: Tata Power, Sagar       │
│  ├ ETA: 2:15 PM · 120km away    │
│  ├ CCS2 · 50kW · ₹8.50/kWh     │
│  └ [Book This Slot →]           │
│  ──────────────────────────────── │
│  Stop 2: ChargeZone, Jabalpur   │
│  └ [Book This Slot →]           │
└───────────────────────────────────┘
```

### 11.4 Route Planner API Call

```typescript
// POST /routes/plan
const payload = {
  origin:         { lat: userLat, lng: userLng },
  destination:    { lat: destLat, lng: destLng },
  current_range_km: 220,
  battery_percent: 65,
  charger_type:   'CCS2',
  vehicle_model:  user.vehicle_type,
};
// Response: route geometry, waypoints, charging_stops[]
// Each stop has station_id → user can directly navigate to slot picker
```

**Deliverable:** Review submission working post-booking. Reviews visible in station detail. Route planner returns EV-aware stops with direct-to-booking flow.

---

## 13. Phase 12 — Demand Forecast & Surge Pricing UI

**Duration:** 2 days
**Endpoints:**
- `GET /v1/demand/predict/{station_id}` — 24-hour demand forecast
- `GET /v1/demand/pricing/{station_id}` — Current surge pricing multiplier

### 12.1 Demand Chart (in Station Detail)

```
"DEMAND FORECAST — NEXT 24 HOURS"

Bar chart (react-native-gifted-charts or Victory Native):
  X-axis: 24 hours (00:00 → 23:00)
  Y-axis: Predicted occupancy %
  Color:
    0–50%  → brand.lightGreen (low demand, good time to charge)
    50–75% → warning (#F59E0B) (moderate)
    75%+   → error (#EF4444) (high demand / surge likely)

Current hour marker: vertical dashed line

Below chart:
  "Best time to charge today: 2 PM – 4 PM (Low demand)"
  "Peak hours: 7 AM – 9 AM, 6 PM – 8 PM"
```

### 12.2 Surge Pricing Banner

```typescript
// Shown on Station Detail and Slot Picker if multiplier > 1.0
// GET /demand/pricing/{station_id} → { base_rate, surge_multiplier, surge_reason }

if (surge_multiplier > 1.0) {
  // Show banner: "⚡ Surge Pricing Active"
  // "Current rate: ₹X.XX/kWh (1.5x base during peak hours)"
  // Banner color: warning background, dark text
  // Link to demand chart to see when it drops
}

if (surge_multiplier === 1.0) {
  // Show: "✓ Standard pricing in effect"
  // Green badge
}
```

### 12.3 Smart Time Suggestion

```typescript
// After fetching demand forecast, compute lowest-demand window in next 8h
// Show as callout in slot picker:
// "💡 Book 2:00 PM – 3:00 PM for lowest prices and shortest wait"
// Tapping auto-selects that time slot
```

**Deliverable:** Demand chart rendering in station detail. Surge pricing banner showing when applicable. Smart time suggestion working in slot picker.

---

## 14. Phase 13 — Polish, Animations & Micro-Interactions

**Duration:** 3 days
**Goal:** Elevate the experience from functional to exceptional. Every interaction should feel intentional.

### 13.1 Reanimated 3 Animations

```typescript
// Inventory of animated interactions:

// 1. Splash screen → fade out into map
//    useSharedValue(1) → withTiming(0, { duration: 400 })

// 2. Station marker press → spring bounce
//    scale: withSpring(1.3, { damping: 12, stiffness: 180 })

// 3. OTP box fill → subtle scale pop
//    scale: withSequence(withTiming(1.05), withTiming(1.0))

// 4. Booking confirmed → confetti burst
//    react-native-confetti-cannon triggered on CONFIRMED status

// 5. Tab switch → smooth icon morph
//    useAnimatedStyle with interpolateColor

// 6. Bottom sheet drag → rubber-band spring
//    Handled by Reanimated worklet via GestureHandler

// 7. Payment processing → pulsing spinner
//    opacity: withRepeat(withTiming(0.3), -1, true)

// 8. Pull-to-refresh → custom branded spinner (leaf rotation)

// 9. Map marker cluster → smooth expand on zoom

// 10. Error shake → OTP input boxes
//     translateX: withSequence(
//       withTiming(-8), withTiming(8), withTiming(-8), withTiming(8), withTiming(0)
//     )
```

### 13.2 Skeleton Loading States

```
Every screen must have a Skeleton variant:
  - StationCard skeleton: grey shimmer boxes for title, distance, badges
  - StationDetail skeleton: hero image placeholder + content rows
  - SlotCard skeleton: time slot boxes shimmering
  - BookingCard skeleton: receipt-like skeleton
  - NotificationItem skeleton: avatar circle + two text lines
```

### 13.3 Haptic Feedback Map

| Interaction | Haptic Type |
|---|---|
| Tab bar tap | `ImpactFeedbackStyle.Light` |
| Station marker tap | `ImpactFeedbackStyle.Medium` |
| "Book Now" press | `ImpactFeedbackStyle.Medium` |
| Payment success | `NotificationFeedbackType.Success` |
| Payment error | `NotificationFeedbackType.Error` |
| OTP digit entry | `ImpactFeedbackStyle.Light` |
| Booking cancel | `NotificationFeedbackType.Warning` |
| Pull-to-refresh | `ImpactFeedbackStyle.Light` |

### 13.4 Empty States

```
Every empty list needs a branded illustration + message:
  - No nearby stations: EV car illustration + "No stations found nearby. Try expanding your radius."
  - No bookings: Calendar illustration + "No bookings yet. Find a station to get started."
  - No notifications: Bell illustration + "You're all caught up!"
  - No reviews: Star illustration + "No reviews yet. Be the first to rate this station."
  - Route planner no results: Map illustration + "No charging stops needed for this route."
```

### 13.5 Accessibility

```
- All interactive elements: accessibilityLabel, accessibilityHint
- Dynamic font scaling: all Typography values respond to user font size setting
- Minimum touch target: 44×44pt (enforced via minHeight/minWidth)
- Color contrast: all text passes WCAG AA (brand.dark #013237 on mint #EAF9E7 = 8.6:1 ✓)
- Screen reader: all map markers have meaningful accessibilityLabel
- Reduced motion: check AccessibilityInfo.isReduceMotionEnabled() and disable animations
```

**Deliverable:** App feels polished and native. All loading states handled. No jarring transitions. Haptics wired. Accessible throughout.

---

## 15. Phase 14 — Testing & Production Hardening

**Duration:** 4 days
**Goal:** Test coverage, error boundary coverage, EAS production build, and performance validation.

### 14.1 Testing Strategy

```
Unit Tests (Jest + @testing-library/react-native):
  - All utility functions (formatters, validators, geo helpers)
  - All Zustand store actions and selectors
  - API error parsing and mapping
  - OTP validation regex
  - Idempotency key generation uniqueness

Component Tests:
  - Button all variants render correctly
  - OTP Input: auto-advance, paste, backspace, submit
  - StationCard: available vs full state rendering
  - SlotCard: available vs booked state (disabled)
  - BookingCard: all status variants

Integration Tests:
  - Auth flow: send OTP → verify → store tokens → /auth/me
  - Booking flow: slot selection → confirm → payment → confirmation
  - Cancel flow: trigger cancel → confirmation modal → DELETE → list update
  - Notification flow: mark read → badge count decrements

E2E Tests (Detox):
  - Full booking happy path on test device
  - Auth → Map → Station → Slot → Book → Pay → Confirm
  - Cancel a booking end-to-end
  - Notification deep link navigation
```

### 14.2 Performance Targets

| Metric | Target | Measurement |
|---|---|---|
| Map render (cold, 4G) | < 2 seconds | Flipper Performance Monitor |
| Station list fetch + render | < 1.5 seconds | React DevTools Profiler |
| Booking flow (tap to confirm) | < 3 taps | Manual UX audit |
| JS bundle size | < 3 MB | `expo export` output |
| Memory usage (idle) | < 120 MB | Xcode Instruments / Android Studio |
| JS thread FPS during animation | 60 fps | Reanimated worklet (UI thread) |

### 14.3 Error Boundary Coverage

```typescript
// src/components/common/ErrorBoundary.tsx
// Wrap every major screen with an ErrorBoundary
// Fallback UI: "Something went wrong" + Retry button + Report Issue link
// Errors forwarded to Sentry (or equivalent)
// Never let a white screen reach the user
```

### 14.4 EAS Build Configuration

```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "env": { "EXPO_PUBLIC_API_URL": "https://staging-api.kairo.in/v1" }
    },
    "production": {
      "autoIncrement": true,
      "env": { "EXPO_PUBLIC_API_URL": "https://api.kairo.in/v1" }
    }
  },
  "submit": {
    "production": {
      "android": { "serviceAccountKeyPath": "./google-service-account.json" }
    }
  }
}
```

### 14.5 Crash Monitoring & Analytics

```
- Sentry React Native: crash reports, JS error tracking, performance traces
- Expo Analytics: screen views, session duration
- Custom event tracking: booking_initiated, booking_confirmed, payment_failed
- All analytics respect user consent (DPDP Act compliance — India)
```

**Deliverable:** All critical paths tested. EAS builds generating successfully for development, preview, and production. Sentry catching and reporting errors. Performance targets met.

---

## 16. Cross-Cutting Concerns

### 16.1 Offline Handling

```
Strategy: Optimistic reads, fail-fast writes

Reads (can serve stale):
  - Last-known nearby stations from React Query cache (MMKV persisted)
  - Last-known user profile from Zustand persist
  - Notification list from cache

Writes (must fail explicitly):
  - Booking creation: show "No internet connection. Please retry." toast
  - Payment: Razorpay SDK handles internally
  - OTP request: show connectivity error

Global offline banner:
  - NetInfo listener detects offline state
  - Yellow banner: "You're offline — showing cached data"
  - Auto-dismisses when connection restored
```

### 16.2 Token Security

```
- Access token (15 min): MMKV encrypted storage, never logs
- Refresh token (7 days): MMKV encrypted storage
- Never stored in AsyncStorage (unencrypted)
- Never logged to console in production builds
- Tokens purged on logout AND on token refresh failure
```

### 16.3 API Error Normalizer

```typescript
// src/utils/apiError.ts
// All API errors normalized to a standard shape:
interface KairoApiError {
  code: string;       // e.g. "SLOT_UNAVAILABLE"
  message: string;    // Human-readable, displayable directly
  details?: unknown;
  status: number;
}

// Every React Query onError receives a KairoApiError
// Toast.show({ type: 'error', text1: error.message }) — no raw stack traces to UI
```

### 16.4 IST Timezone Handling

```typescript
// All timestamps from API are ISO 8601 with +05:30 offset
// Display formatting always in IST:
import { format, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

const IST = 'Asia/Kolkata';

export const formatBookingTime = (isoString: string): string => {
  const date = parseISO(isoString);
  const istDate = utcToZonedTime(date, IST);
  return format(istDate, 'hh:mm a, dd MMM yyyy');  // e.g. "09:00 AM, 13 May 2026"
};
```

---

## 17. Master Screen Inventory

| Screen | Route | Auth Required | Primary Endpoint |
|---|---|---|---|
| Splash | `/` | No | None |
| Phone Entry | `/(auth)/index` | No | `POST /auth/otp/send` |
| OTP Verify | `/(auth)/otp` | No | `POST /auth/otp/verify` |
| Profile Setup | `/(auth)/profile-setup` | No | `PATCH /auth/me` |
| Map / Discover | `/(app)/index` | Yes | `GET /stations/nearby` |
| Station Detail | `/station/[id]` | Yes | `GET /stations/{id}` |
| Slot Picker | `/station/[id]/slots` | Yes | `GET /slots/stations/{id}` |
| Booking Confirm | `/booking/confirm` | Yes | `POST /bookings` |
| Booking Detail | `/booking/[id]` | Yes | `GET /bookings` |
| My Bookings | `/(app)/bookings` | Yes | `GET /bookings` |
| Notifications | `/(app)/notifications` | Yes | `GET /notifications` |
| Profile | `/(app)/profile` | Yes | `GET /auth/me` |
| Route Planner | `/route-planner` | Yes | `POST /routes/plan` |
| Reviews List | `/station/[id]/reviews` | Yes | `GET /reviews/stations/{id}` |
| Demand Forecast | `/station/[id]/demand` | Yes | `GET /demand/predict/{id}` |

**Total screens: 15**

---

## 18. State Architecture Reference

```
┌─────────────────────────────────────────────────────┐
│                   State Layers                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  SERVER STATE — TanStack Query                        │
│  ├── ['stations', 'nearby', filters]  → stale: 30s  │
│  ├── ['station', id]                  → stale: 60s  │
│  ├── ['slots', stationId, date]       → stale: 10s  │
│  ├── ['bookings']                     → stale: 30s  │
│  ├── ['booking', id]                  → stale: 15s  │
│  ├── ['notifications']                → stale: 30s  │
│  ├── ['reviews', stationId]           → stale: 5m   │
│  └── ['demand', stationId]            → stale: 5m   │
│                                                       │
│  CLIENT STATE — Zustand + MMKV persist               │
│  ├── auth.store     → tokens, user (persisted)       │
│  ├── map.store      → region, filters, selection     │
│  ├── booking.store  → draft booking in progress      │
│  └── ui.store       → toasts, modals, flags          │
│                                                       │
│  REAL-TIME — WebSocket + Supabase Realtime           │
│  ├── Slot availability → patches TanStack cache      │
│  ├── Booking status   → patches TanStack cache       │
│  └── Station count    → patches TanStack cache       │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

*Document: React-app-design.md · Kairo (EVChargeFinder) · v1.0 · April 2026*
*Author: Shubhranshu Das (Reesh) · Reference: PRD v1.0 · HLD v1.0 · API_SPEC v1.0*
