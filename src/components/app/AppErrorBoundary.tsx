import React from 'react';
import { StyleSheet, View } from 'react-native';
import * as Updates from 'expo-updates';

import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { Colors, Spacing } from '@/constants';
import { Sentry } from '@/lib/monitoring';

interface AppErrorBoundaryProps {
    children: React.ReactNode;
}

interface AppErrorBoundaryState {
    error: Error | null;
    resetKey: number;
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
    state: AppErrorBoundaryState = {
        error: null,
        resetKey: 0,
    };

    static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
        return { error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        Sentry.captureException(error, {
            contexts: {
                react: {
                    componentStack: errorInfo.componentStack,
                },
            },
        });
    }

    private handleRetry = async () => {
        try {
            await Updates.reloadAsync();
        } catch {
            this.setState((current) => ({
                error: null,
                resetKey: current.resetKey + 1,
            }));
        }
    };

    render() {
        if (this.state.error) {
            return (
                <View style={styles.container} testID="global-error-boundary">
                    <Typography variant="h2" color="primary" align="center">
                        Something went wrong
                    </Typography>
                    <Typography variant="body" color="secondary" align="center" style={styles.message}>
                        The app hit an unexpected problem, but your session is still safe. Try reloading this screen.
                    </Typography>
                    <Button
                        label="Reload app"
                        onPress={() => {
                            void this.handleRetry();
                        }}
                        fullWidth
                        testID="error-boundary-retry"
                    />
                </View>
            );
        }

        return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        backgroundColor: Colors.brand.white,
    },
    message: {
        marginTop: Spacing.sm,
        marginBottom: Spacing.xl,
    },
});
