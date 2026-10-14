/**
 * Expo config plugin — injects the Google Maps API key meta-data tag into
 * AndroidManifest.xml so that react-native-maps can render Google Maps tiles
 * on Android builds (EAS / prebuild).
 *
 * The API key is read from app.json's `extra.googleMapsApiKey`.
 */
const { withAndroidManifest } = require('expo/config-plugins');

const GOOGLE_MAPS_API_KEY =
  (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '').trim() ||
  'AIzaSyBz4h_RTdZxvCr4Tw7lkc5us6A9cCS_Gbc';

function withGoogleMapsApiKey(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const application = manifest.application && manifest.application[0];
    if (!application) return cfg;

    application['meta-data'] = application['meta-data'] || [];

    // Avoid duplicate entries if the plugin runs more than once.
    const existing = application['meta-data'].find(
      (m) => m?.$?.['android:name'] === 'com.google.android.geo.API_KEY'
    );
    if (existing) {
      existing.$['android:value'] = GOOGLE_MAPS_API_KEY;
    } else {
      application['meta-data'].push({
        $: {
          'android:name': 'com.google.android.geo.API_KEY',
          'android:value': GOOGLE_MAPS_API_KEY
        }
      });
    }

    return cfg;
  });
}

module.exports = withGoogleMapsApiKey;
