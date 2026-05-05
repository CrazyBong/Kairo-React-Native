// src/constants/colors.ts
/**
 * Kairo Design System: Colors
 * Synthesizing the requested Mint/Green Kairo Palette with Figma geometry/animations.
 */

export const Colors = {
    // Brand (Kairo Mint Palette)
    brand: {
        mintWhite: '#EAF9E7',
        lightGreen: '#C0E6BA',
        primary: '#4CA771',
        dark: '#013237',
        white: '#ffffff',
    },

    // UI Surfaces
    surface: {
        default: '#ffffff',
        subtle: '#EAF9E7',  // Mint White for subtle backgrounds
        inverted: '#013237', // Dark
        glassDark: 'rgba(1, 50, 55, 0.08)', // Dark with low opacity
        glassLight: 'rgba(255, 255, 255, 0.16)',
        disabled: '#C0E6BA', // Light Green
    },

    // Typography
    text: {
        primary: '#013237',
        secondary: 'rgba(1, 50, 55, 0.65)',
        tertiary: 'rgba(1, 50, 55, 0.40)',
        disabled: '#C0E6BA',
        inverted: '#ffffff',
    },

    // Borders & Dividers
    border: {
        default: '#013237',
        subtle: 'rgba(192, 230, 186, 0.4)',
        divider: '#C0E6BA',
    },

    // Semantic
    semantic: {
        error: '#EF4444',
        success: '#4CA771', // Matches primary brand color
        warning: '#F59E0B',
    },

    // Charger Types (For Map Badges)
    charger: {
        ccs2: '#4CA771',
        type2: '#013237',
        chademo: '#F59E0B',
        bharat: '#C0E6BA',
    },
} as const;

export type ColorToken = typeof Colors;
