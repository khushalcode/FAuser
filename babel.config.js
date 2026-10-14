/**
 * Babel config for Expo SDK 52 + NativeWind v4 + React Native Reanimated.
 *
 * - `babel-preset-expo` with `jsxImportSource: 'nativewind'` wires the JSX
 *   runtime to NativeWind so className props are picked up automatically.
 * - `react-native-reanimated/plugin` MUST be last — it transforms worklets
 *   used by Reanimated animations across the app.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel'
    ],
    plugins: [
      'react-native-reanimated/plugin'
    ]
  };
};
