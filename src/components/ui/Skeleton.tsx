// src/components/ui/Skeleton.tsx
import React, { useEffect } from 'react';
import { DimensionValue, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Colors, Radius } from '@/constants';

interface SkeletonProps {
    width?: DimensionValue;
    height?: DimensionValue;
    radius?: keyof typeof Radius;
    style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    radius = 'none',
    style,
}) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle<ViewStyle>(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.base,
                {
                    width,
                    height,
                    borderRadius: Radius[radius],
                },
                animatedStyle,
                style,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    base: {
        backgroundColor: Colors.surface.glassDark,
        overflow: 'hidden',
    },
});
