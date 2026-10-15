import { ExpoConfig, ConfigContext } from 'expo/config';

const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
  'AIzaSyBz4h_RTdZxvCr4Tw7lkc5us6A9cCS_Gbc';

// Backend config (Firebase + Supabase) lives in app.json under `extra`.
// We merge it back here so `Constants.expoConfig.extra` keeps it at runtime
// while still allowing EXPO_PUBLIC_* env vars to override individual keys.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Food Munch',
  slug: 'food-munch-customer',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'foodmunch',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#10B981'
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.foodmunch.customer',
    config: {
      googleMapsApiKey: GOOGLE_MAPS_API_KEY
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#10B981'
    },
    package: 'com.foodmunch.customer',
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'NOTIFICATIONS',
      'VIBRATE'
    ],
    googleServicesFile: './google-services.json',
    config: {
      googleMaps: {
        apiKey: GOOGLE_MAPS_API_KEY
      }
    }
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Food Munch to use your location for delivery.'
      }
    ],
    [
      'expo-notifications',
      {
        color: '#10B981',
        defaultChannel: 'orders'
      }
    ],
    './plugins/google-maps-plugin.js'
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    ...config?.extra,
    eas: {
      projectId: 'food-munch-customer'
    },
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  }
});
