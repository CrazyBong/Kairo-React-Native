// src/components/ui/Typography.tsx
import React from 'react';
import { Text, TextProps } from 'react-native';
import { Typography as Tokens, Colors } from '@/constants';

type Variant = keyof typeof Tokens;
type Color = keyof typeof Colors.text | 'success' | 'error' | 'warning';

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
    const semanticColor = Colors.semantic[color as keyof typeof Colors.semantic];
    const resolvedColor =
        color in Colors.text
            ? Colors.text[color as keyof typeof Colors.text]
            : semanticColor ?? Colors.text.primary;

    return (
        <Text
            style={[
                Tokens[variant],
                { color: resolvedColor, textAlign: align },
                style,
            ]}
            {...rest}
        >
            {children}
        </Text>
    );
};
