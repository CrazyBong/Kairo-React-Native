// src/components/ui/Card.tsx
import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '@/constants';

interface CardProps extends ViewProps {
    elevated?: boolean;
    padding?: keyof typeof Spacing;
}

export const Card: React.FC<CardProps> = ({
    children,
    elevated = false,
    padding = 'lg',
    style,
    ...rest
}) => {
    return (
        <View
            style={[
                styles.base,
                elevated ? Shadow.subtle : Shadow.none,
                { padding: Spacing[padding] },
                style,
            ]}
            {...rest}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        backgroundColor: Colors.surface.default,
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: Colors.border.divider,
    },
});
