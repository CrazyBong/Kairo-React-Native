# Kairo Frontend Endpoint Map

> Last updated: `2026-05-06`  
> Frontend repo: `C:\Users\Lenovo\Kairo-React-Native`  
> Backend repo reviewed: `C:\Users\Lenovo\Backend-Ev`

## Summary

The frontend is now wired to real backend APIs for:

- auth
- profile bootstrap and profile update
- nearby station discovery
- station detail
- slot fetching
- bookings
- payment verification
- route planning
- notifications
- demand/pricing read paths
- station reviews read path

The main remaining gaps are now concentrated in:

- real station inventory data in the backend database
- live device location replacing demo Bhopal coordinates
- real frontend WebSocket slot synchronization
- real payment SDK checkout instead of the current simulated checkout step
- review submission UI
- wallet/profile-summary product endpoints

## Base API

- Base URL is read from `EXPO_PUBLIC_API_URL`.
- Fallback base URL in code is `http://127.0.0.1:8000/v1`.
- Auth uses Bearer JWT in the `Authorization` header.
- Requests are handled through `src/api/client.ts`.
- `POST`, `PATCH`, `PUT`, and `DELETE` requests get idempotency keys automatically.
- `401` responses trigger refresh flow through `POST /auth/token/refresh`.

## Wired Endpoints

### Auth

Source: `src/api/auth.ts`

| Method | Endpoint | Frontend usage | Status |
|---|---|---|---|
| `POST` | `/auth/otp/send` | `app/(auth)/index.tsx`, resend in `app/(auth)/otp.tsx` | Live |
| `POST` | `/auth/otp/verify` | `app/(auth)/otp.tsx` | Live |
| `POST` | `/auth/token/refresh` | `src/api/client.ts` interceptor | Live |
| `GET` | `/auth/me` | `src/providers/AuthProvider.tsx` | Live |
| `PATCH` | `/auth/me` | `app/(auth)/profile-setup.tsx`, `app/profile/personal-info.tsx` | Live |
| `DELETE` | `/auth/logout` | `app/(app)/profile.tsx` | Live |

Notes:

- Auth refresh is queue-based and production-safe.
- Hydration and current-user bootstrap are wired through the auth provider.
- Profile update now persists correctly and returns the full user payload the app expects.

### Stations

Source: `src/api/stations.ts`

| Method | Endpoint | Frontend usage | Status |
|---|---|---|---|
| `GET` | `/stations/nearby` | `app/(app)/index.tsx` via `useNearbyStations()` | Live |
| `GET` | `/stations/{station_id}` | `app/station/[id].tsx` via `useStationDetail()` | Live |

Notes:

- Discover screen is backend-powered.
- Map pins and list cards both use nearby station data.
- The current search origin is still demo Bhopal coordinates, not device GPS yet.

### Slots

Source: `src/api/slots.ts`

| Method | Endpoint | Frontend usage | Status |
|---|---|---|---|
| `GET` | `/slots/stations/{station_id}` | `app/station/[id]/slots.tsx` via `useStationSlots()` | Live |

Notes:

- Slot list fetch is real.
- Frontend still polls every 15 seconds.
- `useStationWebSocket()` is still a mock interval and is not connected to the real backend WebSocket transport yet.

### Bookings

Source: `src/api/bookings.ts`

| Method | Endpoint | Frontend usage | Status |
|---|---|---|---|
| `POST` | `/bookings` | `app/booking/confirm.tsx` | Live |
| `GET` | `/bookings` | `app/(app)/bookings.tsx`, derived profile stats in `app/(app)/profile.tsx` | Live |
| `DELETE` | `/bookings/{booking_id}` | Booking cancel flow, payment-cancel cleanup | Live |

Notes:

- Booking creation is real.
- Booking cancellation is real.
- Payment cancellation no longer performs client-side financial rollback. The app hands off to server-side reconciliation and lock expiry behavior instead.

### Payments

Source: `src/api/payments.ts`

| Method | Endpoint | Frontend usage | Status |
|---|---|---|---|
| `POST` | `/payments/verify` | `app/booking/confirm.tsx` after checkout success | Live |
| `POST` | `/payments/webhook` | Backend-only | Backend only |

Notes:

- Backend verification is live.
- Backend webhook reconciliation is live.
- Frontend checkout is still simulated in `src/hooks/useRazorpay.ts`.
- Replacing the simulated checkout with the real SDK is still pending.

### Routes

Source: `src/api/routing.ts`

| Method | Endpoint | Frontend usage | Status |
|---|---|---|---|
| `POST` | `/routes/plan` | `app/route-planner.tsx` | Live |

Notes:

- Route planner is backend-powered now.
- Typed destination is honored only when it matches one of the currently supported presets.
- Origin is still fixed to Bhopal demo coordinates until live location is integrated.

### Notifications

Source: `src/api/notifications.ts`

| Method | Endpoint | Frontend usage | Status |
|---|---|---|---|
| `GET` | `/notifications` | `app/(app)/notifications.tsx`, unread badge surfaces | Live |
| `POST` | `/notifications/{notification_id}/read` | Notification tap flow | Live |
| `POST` | `/notifications/read-all` | Mark-all-read flow | Live |

### Demand

Source: `src/api/demand.ts`

| Method | Endpoint | Frontend usage | Status |
|---|---|---|---|
| `GET` | `/demand/predict/{station_id}` | `app/station/[id].tsx`, `DemandChart` | Live |
| `GET` | `/demand/pricing/{station_id}` | `app/station/[id].tsx` | Live |

### Reviews

Source: `src/api/reviews.ts`

| Method | Endpoint | Frontend usage | Status |
|---|---|---|---|
| `GET` | `/reviews/stations/{station_id}` | `app/station/[id].tsx` | Live |
| `POST` | `/reviews` | No completed UI flow yet | Backend exists, frontend not wired |

## Backend Endpoints Present But Not Yet Wired in Frontend

These routes exist in `C:\Users\Lenovo\Backend-Ev\app\routers`, but the app does not fully consume them yet.

### Review Submission

| Method | Endpoint | Status |
|---|---|---|
| `POST` | `/reviews` | Backend exists, no submission UI yet |

### Demand Training / Admin Paths

| Method | Endpoint | Status |
|---|---|---|
| `POST` | `/demand/train/{station_id}` | Admin-only backend path, no frontend wiring |
| `PATCH` | `/admin/stations/{station_id}/slots/{slot_id}` | Backend only |
| `GET` | `/admin/stations/{station_id}/bookings` | Backend only |

### IoT / Hardware

| Method | Endpoint | Status |
|---|---|---|
| `POST` | `/iot/heartbeat` | Backend only |

### Observability

| Method | Endpoint | Status |
|---|---|---|
| `GET` | `/metrics` | Backend only |

## Backend Capabilities the Frontend Still Does Not Consume Fully

### WebSocket Slot Updates

Backend routes exist:

- `app/routers/ws.py`
- `app/routers/websockets.py`

Current frontend behavior:

- `src/hooks/useStationWebSocket.ts` still uses a mock interval
- slot state is not yet subscribed to the real backend websocket stream

### Real Device Location

No backend gap here, but the frontend still does not use live GPS for discovery or route origin.

Impact:

- Even after seeding real station rows, discovery will still be centered on demo Bhopal coordinates until the frontend location pass is done.

## Backend Gaps Still Blocking Fully Real Product Surfaces

These are the meaningful remaining backend product gaps beyond raw station data.

### Missing Wallet / Balance API

No wallet balance or top-up endpoint was found in the backend routers.

Impact:

- Wallet UI remains hidden instead of mocked.

Recommended future endpoints:

- `GET /wallet`
- `POST /wallet/top-up`
- `GET /wallet/transactions`

### Missing Profile Summary / Stats API

No dedicated profile-summary endpoint was found.

Impact:

- Profile stats are derived from bookings where possible.
- Richer metrics remain unavailable.

Recommended future endpoint:

- `GET /users/me/summary`

### Missing Station Inventory / Import Tooling

The current backend discovery API exists, but the `stations` table is empty.

Impact:

- Discovery is technically integrated but practically empty until real station rows are seeded/imported.

## Frontend Files Owning API Integration

### Request layer

- `src/api/client.ts`
- `src/api/auth.ts`
- `src/api/stations.ts`
- `src/api/slots.ts`
- `src/api/bookings.ts`
- `src/api/payments.ts`
- `src/api/routing.ts`
- `src/api/notifications.ts`
- `src/api/demand.ts`
- `src/api/reviews.ts`

### Main consuming screens

- `app/(auth)/index.tsx`
- `app/(auth)/otp.tsx`
- `app/(auth)/profile-setup.tsx`
- `app/(app)/index.tsx`
- `app/(app)/notifications.tsx`
- `app/(app)/profile.tsx`
- `app/profile/personal-info.tsx`
- `app/station/[id].tsx`
- `app/station/[id]/slots.tsx`
- `app/booking/confirm.tsx`
- `app/(app)/bookings.tsx`
- `app/route-planner.tsx`

## Current Reality Check

### Core paths that are integrated and working

- Auth send OTP / verify OTP / refresh token
- Fetch current user
- Update profile
- Logout API call from profile
- Nearby station discovery API
- Station detail
- Slot fetching
- Booking creation
- Booking cancellation
- Payment verification
- Route planning
- Notifications list / mark-read / mark-all-read
- Demand prediction read path
- Station pricing read path
- Station reviews read path

### Still partial, mocked, or waiting on follow-up work

- Real station inventory data in DB
- Live GPS-based discovery/origin
- Real WebSocket slot sync on the frontend
- Review submission UI
- Real Razorpay SDK checkout
- Wallet / balance
- Rich profile summary metrics

## Recommended Next Doc Update Trigger

Update this file again when any of the following happen:

- station import/seed tooling lands
- live device location replaces demo Bhopal coordinates
- real frontend websocket subscription replaces the mock slot updater
- review submission UI is added
- wallet endpoints are added
- real Razorpay SDK replaces the current simulated checkout hook
