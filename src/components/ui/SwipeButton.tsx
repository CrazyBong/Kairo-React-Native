import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants';
import { Typography } from './Typography';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

const BUTTON_WIDTH = Dimensions.get('window').width - Spacing.xl * 2;
const BUTTON_HEIGHT = 72;
const KNOB_WIDTH = 130;
const KNOB_HEIGHT = 62;
const SWIPE_RANGE = BUTTON_WIDTH - KNOB_WIDTH - 10;

interface SwipeButtonProps {
    label?: string;
    onSwipeComplete: () => void;
    style?: ViewStyle;
}

export const SwipeButton: React.FC<SwipeButtonProps> = ({
    label = "START",
    onSwipeComplete,
    style
}) => {
    const translateX = useSharedValue(0);
    const [isTriggered, setIsTriggered] = useState(false);

    const handleComplete = () => {
        if (!isTriggered) {
            setIsTriggered(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onSwipeComplete();
        }
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = Math.min(SWIPE_RANGE, Math.max(0, event.translationX));
        })
        .onEnd(() => {
            if (translateX.value > SWIPE_RANGE * 0.8) {
                translateX.value = withSpring(SWIPE_RANGE);
                runOnJS(handleComplete)();
            } else {
                translateX.value = withSpring(0);
            }
        });

    const knobStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    // Fade out the track arrows as knob slides over them
    const trackTextStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            translateX.value,
            [SWIPE_RANGE * 0.4, SWIPE_RANGE * 0.8],
            [0.4, 0],
            Extrapolate.CLAMP
        ),
    }));

    return (
        <View style={[styles.container, style]}>
            {/* Right-aligned Track Arrows (Vanish on Swipe) */}
            <Animated.View style={[styles.trackArrowContainer, trackTextStyle]}>
                <Typography variant="h3" style={styles.trackArrow}>»</Typography>
            </Animated.View>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.knob, knobStyle]}>
                    <Typography
                        variant="button"
                        style={styles.startText}
                    >
                        {label}
                    </Typography>
                    <Ionicons name="flash" size={24} color={Colors.brand.white} />
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        backgroundColor: Colors.brand.dark,
        borderRadius: Radius.pill,
        justifyContent: 'center',
        padding: 5,
        overflow: 'hidden',
    },
    knob: {
        width: KNOB_WIDTH,
        height: KNOB_HEIGHT,
        backgroundColor: Colors.brand.primary,
        borderRadius: Radius.pill,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    startText: {
        color: Colors.brand.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 1,
    },
    trackArrowContainer: {
        position: 'absolute',
        right: 40,
        height: '100%',
        justifyContent: 'center',
    },
    trackArrow: {
        color: Colors.brand.white,
        fontSize: 28,
        fontWeight: '300',
        letterSpacing: -2,
    },
});
