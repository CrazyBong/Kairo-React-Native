// src/constants/typography.ts
/**
 * Kairo Design System: Typography
 * Using Inter to approximate Figma's granular weights and Tesla's clean sans structure.
 * Letter spacing is slightly negative across the board to mimic Figma's structural tight kerning.
 */
import { Platform } from 'react-native';

export const FontFamily = {
    light: 'Inter_300Light', // Approximating figmaSans 320-330
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium', // Approximating figmaSans 450-480, Tesla UI 500
    semiBold: 'Inter_600SemiBold', // Approximating figmaSans 540
    bold: 'Inter_700Bold', // Approximating figmaSans 700
    mono: Platform.select({ ios: 'Menlo', android: 'monospace' }) as string, // figmaMono fallback
} as const;

export const Typography = {
    // Display / Hero (Tesla Scale: 40px, Figma: 86px -> React Native App compromise: 40px)
    display: { fontSize: 40, fontFamily: FontFamily.semiBold, lineHeight: 48, letterSpacing: -0.96 },

    // Headings
    h1: { fontSize: 32, fontFamily: FontFamily.semiBold, lineHeight: 40, letterSpacing: -0.5 },
    h2: { fontSize: 26, fontFamily: FontFamily.medium, lineHeight: 34, letterSpacing: -0.26 },
    h3: { fontSize: 20, fontFamily: FontFamily.medium, lineHeight: 28, letterSpacing: -0.2 },
    h4: { fontSize: 16, fontFamily: FontFamily.semiBold, lineHeight: 24, letterSpacing: -0.14 },

    // Body
    bodyLarge: { fontSize: 18, fontFamily: FontFamily.light, lineHeight: 28, letterSpacing: -0.2 },
    body: { fontSize: 16, fontFamily: FontFamily.regular, lineHeight: 24, letterSpacing: -0.14 },
    bodyLight: { fontSize: 16, fontFamily: FontFamily.light, lineHeight: 24, letterSpacing: -0.14 },
    bodySmall: { fontSize: 14, fontFamily: FontFamily.regular, lineHeight: 20, letterSpacing: -0.1 },

    // UI Elements
    button: { fontSize: 15, fontFamily: FontFamily.medium, lineHeight: 20, letterSpacing: -0.1 },
    label: { fontSize: 13, fontFamily: FontFamily.medium, lineHeight: 18, letterSpacing: 0 },
    caption: { fontSize: 12, fontFamily: FontFamily.regular, lineHeight: 16, letterSpacing: 0 },

    // Mono / Technical Tags (Figma style)
    mono: { fontSize: 12, fontFamily: FontFamily.mono, lineHeight: 16, letterSpacing: 0.6, textTransform: 'uppercase' as const },
} as const;
