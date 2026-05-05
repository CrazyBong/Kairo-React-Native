# Kairo Frontend Endpoint Map

> Last updated: `2026-05-06`  
> Frontend repo: `C:\Users\Lenovo\Kairo-React-Native`  
> Backend repo reviewed: `C:\Users\Lenovo\Backend-Ev`

## Summary

The frontend is now mostly wired to real backend APIs for auth, discovery, station detail, slots, bookings, payment verification, and route planning.

The main remaining gaps are not core booking/auth problems anymore. They are secondary product surfaces where the backend either does not expose an endpoint yet or the frontend is intentionally still using a local simulation or placeholder UI.

## Base API

- Base URL is read from `EXPO_PUBLIC_API_URL`.
- Fallback base URL in code is `http://localhost:8000/v1`.
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
| `PATCH` | `/auth/me` | `app/(auth)/profile-setup.tsx`, profile update flows | Live |
| `DELETE` | `/auth/logout` | API helper exists in `src/api/auth.ts` | Backend exists, frontend logout is currently local-store driven |

Notes:

- Auth refresh is queue-based and production-safe.
- Hydration and current-user bootstrap are wired through the auth provider.
- OTP and profile setup now surface normalized backend errors to the user.

### Stations

Source: `src/api/stations.ts`

| Method | Endpoint | Frontend usage | Status |
|---|---|---|---|
| `GET` | `/stations/nearby` | `app/(app)/index.tsx` via `useNearbyStations()` | Live |
| `GET` | `/stations/{station_id}` | `app/station/[id].tsx` via `useStationDetail()` | Live |

Notes:

- Discover screen is backend-powered.
- Map pins and list cards both use nearby station data.
- Station detail handles missing `address`, `image_url`, and `total_reviews` safely.

### Slots

Source: `src/api/slots.ts`

| Method | Endpoint | Frontend usage | Status |
|---|---|---|---|
| `GET` | `/slots/stations/{station_id}` | `app/station/[id]/slots.tsx` via `useStationSlots()` | Live |

Notes:

- Slot list is polled with React Query.
- Frontend start-time generation is client-side and filtered to future times only.

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
- Payment cancellation now performs best-effort orphaned-booking cleanup.

### Payments

Source: `src/api/payments.ts`

| Method | Endpoint | Frontend usage | Status |
|---|---|---|---|
| `POST` | `/payments/verify` | `app/booking/confirm.tsx` after checkout success | Live |
| `POST` | `/payments/webhook` | Backend-only | Backend only |

Notes:

- Frontend payment UI is still a simulated Razorpay interaction in `src/hooks/useRazorpay.ts`.
- Verification after checkout is real.
- Webhook confirmation is backend-only as expected.

### Routes

Source: `src/api/routing.ts`

| Method | Endpoint | Frontend usage | Status |
|---|---|---|---|
| `POST` | `/routes/plan` | `app/route-planner.tsx` | Live |

Notes:

- Route planner is backend-powered now.
- The screen no longer relies on hardcoded stop data.
- Battery percentage and vehicle range are user/device-driven inputs on the frontend.

## Backend Endpoints Present But Not Yet Wired in Frontend

These endpoints exist in `C:\Users\Lenovo\Backend-Ev\app\routers`, but the frontend does not yet have a finished integration for them.

### Notifications

Backend router: `app/routers/notifications.py`

| Method | Endpoint | Frontend status |
|---|---|---|
| `GET` | `/notifications` | Not wired |
| `POST` | `/notifications/{notification_id}/read` | Not wired |
| `POST` | `/notifications/read-all` | Not wired |

Current frontend state:

- `app/(app)/notifications.tsx` is still a local/demo surface.

### Demand

Backend router: `app/routers/demand.py`

| Method | Endpoint | Frontend status |
|---|---|---|
| `GET` | `/demand/predict/{station_id}` | Not wired |
| `GET` | `/demand/pricing/{station_id}` | Not wired |

Current frontend state:

- Demand chart and surge-style UI are not fully hydrated from backend yet.

### Reviews

Backend router: `app/routers/reviews.py`

| Method | Endpoint | Frontend status |
|---|---|---|
| `POST` | `/reviews` | Not wired |
| `GET` | `/reviews/stations/{station_id}` | Not wired |

Current frontend state:

- No complete reviews section is integrated yet.

## Backend Capabilities the Frontend Still Does Not Consume Fully

### Logout API

Backend route exists:

- `DELETE /auth/logout`

Current frontend behavior:

- UI logout clears auth state locally.
- The helper exists, but logout is not yet consistently calling the backend route.

### WebSocket Slot Updates

Backend routes exist:

- WebSocket infrastructure is present under `app/routers/ws.py` and `app/routers/websockets.py`.

Current frontend behavior:

- `src/hooks/useStationWebSocket.ts` exists.
- Real-time integration still needs a final end-to-end confirmation against the backend socket contract.

## Backend Gaps Still Blocking Fully Real Product Surfaces

These are the notable missing backend product endpoints or contracts based on the current frontend needs.

### Missing Wallet / Balance API

No wallet balance or top-up endpoint was found in the backend routers.

Impact:

- The wallet card was removed from the profile flow instead of showing fake numbers.

Recommended future endpoints:

- `GET /wallet`
- `POST /wallet/top-up`
- `GET /wallet/transactions`

### Missing Profile Summary / Stats API

No dedicated profile-summary endpoint was found.

Impact:

- Profile stats are now derived from bookings where possible.
- Anything not backed by real data is hidden rather than mocked.

Recommended future endpoint:

- `GET /users/me/summary`

Suggested payload:

```json
{
  "data": {
    "total_charged_kwh": 184.2,
    "completed_sessions": 14,
    "upcoming_sessions": 2,
    "co2_saved_kg": 71.4,
    "favorite_station": {
      "id": "station_123",
      "name": "Tata Power Fast Charge"
    }
  }
}
```

## Frontend Files Owning API Integration

### Request layer

- `src/api/client.ts`
- `src/api/auth.ts`
- `src/api/stations.ts`
- `src/api/slots.ts`
- `src/api/bookings.ts`
- `src/api/payments.ts`
- `src/api/routing.ts`

### Main consuming screens

- `app/(auth)/index.tsx`
- `app/(auth)/otp.tsx`
- `app/(auth)/profile-setup.tsx`
- `app/(app)/index.tsx`
- `app/station/[id].tsx`
- `app/station/[id]/slots.tsx`
- `app/booking/confirm.tsx`
- `app/(app)/bookings.tsx`
- `app/(app)/profile.tsx`
- `app/route-planner.tsx`

## Current Reality Check

### Production-ready core paths

- Auth send OTP / verify OTP / refresh token
- Fetch current user
- Nearby station discovery
- Station detail
- Slot fetching
- Booking creation
- Booking cancellation
- Payment verification
- Route planning

### Still partial or product-placeholder paths

- Notifications
- Demand prediction UI wiring
- Reviews
- Wallet / balance
- Rich profile summary metrics
- Real payment SDK integration
- Final WebSocket contract verification

## Recommended Next Doc Update Trigger

Update this file again when any of the following happen:

- Notifications API is wired
- Demand endpoints are consumed in UI
- Reviews UI is added
- Wallet endpoints are added in backend
- Profile summary endpoint is added in backend
- Real Razorpay SDK replaces the current simulated checkout hook
