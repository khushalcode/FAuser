import { Platform, Dimensions } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const hapticImpact = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (isWeb) return;
  try {
    const Haptics = await import('expo-haptics');
    const map = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy
    };
    await Haptics.impactAsync(map[style]);
  } catch {
    /* haptics not available */
  }
};

export const hapticNotify = async (type: 'success' | 'warning' | 'error' = 'success') => {
  if (isWeb) return;
  try {
    const Haptics = await import('expo-haptics');
    const map = {
      success: Haptics.NotificationFeedbackType.Success,
      warning: Haptics.NotificationFeedbackType.Warning,
      error: Haptics.NotificationFeedbackType.Error
    };
    await Haptics.notificationAsync(map[type]);
  } catch {
    /* haptics not available */
  }
};
