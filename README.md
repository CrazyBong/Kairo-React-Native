# Kairo — Premium EV Charging Experience

![Kairo App Banner](https://img.shields.io/badge/Kairo-EV_Charging-22C55E?style=for-the-badge)
![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-54-000000?style=for-the-badge&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)

Kairo is a high-performance, production-grade React Native application designed for the modern EV owner. Built with a focus on visual excellence, resilient architecture, and seamless hardware-to-software integration.

---

## 🚀 Key Features

-   **Intelligent Station Discovery**: Real-time PostGIS-powered search for nearby charging stations with live availability.
-   **Smart Route Planner**: Calculate optimal charging stops for long-distance journeys based on vehicle range and battery levels.
-   **Seamless Auth Flow**: Passwordless OTP-based authentication with robust JWT management and silent refresh.
-   **Advanced Booking Engine**: Reserve charging slots with sub-second distributed locking and Razorpay payment integration.
-   **Hardware Simulation**: Native-aware charging simulation for development and testing without physical hardware.
-   **Premium UI/UX**: Built with a custom design system, tactile micro-animations (`Reanimated` + `Moti`), and high-fidelity layouts.

---

## 🛠 Tech Stack

-   **Framework**: [Expo](https://expo.dev/) (SDK 54) with [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Manual hydration with MMKV)
-   **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
-   **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) & [Moti](https://moti.fyi/)
-   **Storage**: [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) (High-performance JSI-based storage)
-   **Forms & Validation**: `react-hook-form` + `Zod`
-   **Icons**: `lucide-react-native` & `@expo/vector-icons`

---

## 🏗 Engineering Patterns (FAANG-Grade)

-   **Resilient API Client**: Axios interceptors with stable **Idempotency Keys** (UUID v4) for all mutative operations to prevent duplicate bookings or payments.
-   **Atomic Auth Refresh**: A centralized token refresh queue ensures that multiple concurrent requests don't trigger redundant refresh cycles or race conditions.
-   **Deterministic Hydration**: Manual state hydration from MMKV avoids the common pitfalls of black-box persistence middleware in mobile apps.
-   **Zero-Dependency Logic**: Core utilities and state logic are strictly separated from UI components for high testability.
-   **Native-Aware Fallbacks**: Native modules (like `expo-battery`) utilize environment detection to gracefully fallback to simulators in Web or Expo Go environments.

---

## 📦 Getting Started

### Prerequisites

-   Node.js (v20+)
-   npm or bun
-   Expo Go app (for testing on physical devices)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/Kairo-React-Native.git
    cd Kairo-React-Native
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure environment variables**:
    Create a `.env.development` file in the root:
    ```env
    EXPO_PUBLIC_API_URL=https://api.evchargefinder.in/v1
    EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_key_here
    EXPO_PUBLIC_RAZORPAY_KEY_ID=your_key_here
    ```

4.  **Start the development server**:
    ```bash
    npx expo start
    ```

---

## 📂 Project Structure

```text
├── app/                  # Expo Router (Pages & Layouts)
│   ├── (auth)/           # Authentication flows
│   ├── (app)/            # Authenticated main app
│   └── station/          # Dynamic station detail routes
├── src/
│   ├── api/              # TanStack Query hooks & Axios client
│   ├── components/       # UI Library & Discovery components
│   ├── constants/        # Design system tokens (Colors, Spacing)
│   ├── hooks/            # Custom business logic hooks
│   ├── store/            # Zustand state stores
│   ├── utils/            # Pure JS utilities & formatters
│   └── lib/              # Third-party library wrappers (Storage)
├── assets/               # Static images and fonts
└── Docs/                 # API & Endpoint documentation
```

---

## 🧪 Testing

The project uses Jest and React Native Testing Library for unit and integration testing.

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Developed with ❤️ for the EV Community.**
