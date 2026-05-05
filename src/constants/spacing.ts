// src/constants/spacing.ts
/**
 * Kairo Design System: Spacing & Geometry
 * 8pt grid system.
 * Geometry blends Figma's distinct Pill (50px) / Circle (50%) with sharp edge elements.
 */

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    hero: 80,
} as const;

export const Radius = {
    none: 0,      // Sharp edges for technical panels
    sm: 4,      // Tesla button standard (sharp, slightly softened)
    md: 8,      // Standard cards, images
    lg: 12,     // Large cards
    pill: 50,     // Figma CTA/Tab standard
    circle: 9999, // Perfect circle for icon buttons
} as const;

// Elevation handles shadows. Tesla & Figma rarely use them, favoring border/contrast.
export const Shadow = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    subtle: { // Figma level 2
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    float: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
    },
} as const;
