# Kairo – Frontend API Endpoint Map & Backend Gap Analysis

> Base URL: `http://192.168.29.235:8000/v1`  
> Auth: Bearer JWT in `Authorization` header (managed by `src/api/client.ts`)

---

## ✅ Frontend API Currently Wired

### Auth (`src/api/auth.ts`)

| Method | Endpoint | Called From | Status |
|---|---|---|---|
| `POST` | `/auth/otp/send` | `app/(auth)/index.tsx` | ✅ Implemented |
| `POST` | `/auth/otp/verify` | `app/(auth)/otp.tsx` | ✅ Implemented |
| `GET` | `/auth/me` | `store/auth.store.ts` | ✅ Implemented |
| `DELETE` | `/auth/logout` | `app/(app)/profile.tsx` | ✅ Implemented |
| `PATCH` | `/auth/me` | `app/profile/personal-info.tsx` | ⚠️ Frontend ready, not wired to submit yet |
| `POST` | `/auth/token/refresh` | `src/api/client.ts` (interceptor) | ✅ Interceptor wired |

---

### Stations (`src/api/stations.ts`)

| Method | Endpoint | Called From | Status |
|---|---|---|---|
| `GET` | `/stations/{station_id}` | `app/station/[id].tsx` | ⚠️ Falls back to mock if API fails |
| `GET` | `/stations/nearby` | `src/components/discovery/MapView.tsx` | ❌ **Not called yet — map is schematic mock** |

---

### Slots (`src/api/slots.ts`)

| Method | Endpoint | Called From | Status |
|---|---|---|---|
| `GET` | `/slots/stations/{station_id}?date=` | `app/station/[id]/slots.tsx` | ⚠️ Falls back to mock if API fails |

---

### Bookings _(not yet implemented as API file)_

| Method | Endpoint | Called From | Status |
|---|---|---|---|
| `POST` | `/bookings` | `app/station/[id]/slots.tsx` → `useRazorpay.ts` | ❌ **Mocked in `useRazorpay.ts` — needs real call** |
| `GET` | `/bookings` | `app/(app)/bookings.tsx` | ❌ **Static mock data — needs real call** |
| `DELETE` | `/bookings/{booking_id}` | Cancel flow (not yet wired) | ❌ Not implemented |

---

### Payments _(not yet implemented as API file)_

| Method | Endpoint | Called From | Status |
|---|---|---|---|
| `POST` | `/payments/verify` | After Razorpay callback | ❌ **Mocked — `useRazorpay.ts` skips verification** |
| `POST` | `/payments/webhook` | Razorpay → Backend (server-side) | 🔧 Backend only |

---

### Notifications _(not yet implemented as API file)_

| Method | Endpoint | Called From | Status |
|---|---|---|---|
| `GET` | `/notifications` | `app/(app)/notifications.tsx` | ❌ **Static mock data — needs real call** |
| `POST` | `/notifications/{id}/read` | Tap notification | ❌ Not implemented |
| `POST` | `/notifications/read-all` | Future bulk-read button | ❌ Not implemented |

---

### Demand / Forecasting _(not yet wired)_

| Method | Endpoint | Called From | Status |
|---|---|---|---|
| `GET` | `/demand/predict/{station_id}` | `src/components/discovery/DemandChart.tsx` | ❌ **Hardcoded mock data — needs real call** |
| `GET` | `/demand/pricing/{station_id}` | `app/station/[id].tsx` (surge banner) | ❌ **Hardcoded 1.2x — needs real call** |

---

### Reviews _(not yet wired)_

| Method | Endpoint | Called From | Status |
|---|---|---|---|
| `POST` | `/reviews` | Not yet implemented | ❌ |
| `GET` | `/reviews/stations/{station_id}` | `app/station/[id].tsx` | ❌ Reviews section not yet built |

---

### Routes _(not yet wired)_

| Method | Endpoint | Called From | Status |
|---|---|---|---|
| `POST` | `/routes/plan` | `app/route-planner.tsx` | ❌ **"Calculate" button uses mock stops** |

---

## 🔴 Backend Gaps — Missing or Incomplete

Based on the current frontend needs and `Backend_Implementation.md`, the following backend routes need to be verified or added:

### Critical (Needed to Remove All Mocks)

| # | Backend Route | Gap |
|---|---|---|
| 1 | `GET /stations/nearby` | Must return `lat`, `lng`, `available_slots`, `connectors` for map pins |
| 2 | `POST /bookings` | Must accept `slot_id`, `scheduled_start`, `scheduled_end`, return `booking_id` |
| 3 | `POST /payments/verify` | Called after Razorpay `razorpay_payment_id`, must update booking to `CONFIRMED` |
| 4 | `GET /bookings` | Must return list with `status` enum matching frontend (`Upcoming`, `Completed`, `Cancelled`) |
| 5 | `GET /notifications` | Must return `is_read`, `type`, `title`, `body`, `created_at` |
| 6 | `GET /demand/predict/{station_id}` | Must return 24-hour hourly demand array `[{ hour: 0, load: 0.2 }, ...]` |
| 7 | `GET /demand/pricing/{station_id}` | Must return `{ multiplier: 1.2, is_surge: true }` |

### Important (Phase 11/12 features)

| # | Backend Route | Gap |
|---|---|---|
| 8 | `POST /routes/plan` | Must accept `origin_lat/lng`, `dest_lat/lng`, `battery_pct`, `range_km`, return sorted charging stops |
| 9 | `POST /reviews` | Must accept `station_id`, `rating`, `comment`, `booking_id` |
| 10 | `GET /reviews/stations/{station_id}` | Must return paginated reviews with `user.name` |
| 11 | `POST /notifications/{id}/read` | Mark single notification read |
| 12 | `PATCH /auth/me` | Accept `name`, `email`, `vehicle_type`, `preferred_connector` updates |

### WebSocket (Real-Time)

| # | Event | Gap |
|---|---|---|
| 13 | `ws://host/ws/stations/{station_id}` | Must emit `slot_status_update` events — frontend `useStationWebSocket.ts` is ready to connect |

---

## 🟡 Frontend Work Needed to Wire Everything

Once backend routes are live, replace mocks in:

| File | What to Replace |
|---|---|
| `src/api/` | Add `bookings.ts`, `notifications.ts`, `demand.ts`, `reviews.ts`, `routes.ts` |
| `src/hooks/useRazorpay.ts` | Replace mock booking create + payment verify with real API calls |
| `app/(app)/bookings.tsx` | Replace static array with `useQuery(['bookings'])` |
| `app/(app)/notifications.tsx` | Replace static array with `useQuery(['notifications'])` |
| `src/components/discovery/DemandChart.tsx` | Replace hardcoded data with `useQuery(['demand', stationId])` |
| `app/route-planner.tsx` | Replace mock stops with `POST /routes/plan` result |
| `src/components/discovery/MapView.tsx` | Replace static markers with `GET /stations/nearby` |
| `src/hooks/useStationWebSocket.ts` | Replace `setInterval` mock with `new WebSocket(url)` |
