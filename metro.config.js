/**
 * Metro config for Expo + NativeWind v4 + react-native-maps web stub.
 *
 * - `withNativeWind` injects the Tailwind-generated className styles from
 *   `./global.css` so NativeWind can resolve them at runtime.
 * - `react-native-maps` is a native-only module. On web builds Metro resolves
 *   it to a local stub (`stubs/react-native-maps.js`) that renders a neutral
 *   placeholder so the app keeps loading on `expo start --web`.
 */
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);
const finalConfig = withNativeWind(config, { input: './global.css' });

const stub = path.resolve(__dirname, 'stubs/react-native-maps.js');
const prevResolve = finalConfig.resolver.resolveRequest;

finalConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  const fromMapsPkg =
    context.originModulePath &&
    context.originModulePath.includes('/node_modules/react-native-maps/');

  if (platform === 'web' && (moduleName.startsWith('react-native-maps') || fromMapsPkg)) {
    return { type: 'sourceFile', filePath: stub };
  }

  return prevResolve
    ? prevResolve(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = finalConfig;
