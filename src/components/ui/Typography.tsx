// src/components/ui/Typography.tsx
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Typography as Tokens, Colors } from '@/constants';

type Variant = keyof typeof Tokens;
type Color = keyof typeof Colors.text;

interface TypographyProps extends TextProps {
    variant?: Variant;
    color?: Color;
    align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Typography: React.FC<TypographyProps> = ({
    variant = 'body',
    color = 'primary',
    align = 'left',
    style,
    children,
    ...rest
}) => {
    return (
        <Text
            style={[
                Tokens[variant],
                { color: Colors.text[color], textAlign: align },
                style,
            ]}
            {...rest}
        >
            {children}
        </Text>
    );
};
