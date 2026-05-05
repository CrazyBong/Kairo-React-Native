/* eslint-disable @typescript-eslint/no-require-imports */

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    const Icon = ({ name }: { name?: string }) => React.createElement(Text, null, name ?? 'icon');

    return {
        Ionicons: Icon,
        MaterialCommunityIcons: Icon,
    };
});
