/**
 * ThemeToggle — animated light/dark mode switch.
 *
 * Renders a pill-shaped toggle with sun/moon icons that smoothly cross-fade
 * when the theme changes. Designed to drop into any header or settings row.
 */
import React from 'react';
import { Pressable, View, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useThemeStore, useThemeColors, useIsDark } from '@/store/theme';
import { hapticImpact } from '@/utils/platform';

interface Props {
  /** Visual size — 'sm' for headers, 'md' for settings rows. */
  size?: 'sm' | 'md';
}

export function ThemeToggle({ size = 'sm' }: Props) {
  const colors = useThemeColors();
  const isDark = useIsDark();
  const toggle = useThemeStore((s) => s.toggle);

  const dim = size === 'sm' ? { pill: 46, knob: 22, icon: 14 } : { pill: 56, knob: 26, icon: 16 };
  const knobPos = React.useRef(new Animated.Value(isDark ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(knobPos, {
      toValue: isDark ? 1 : 0,
      duration: 280,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [isDark, knobPos]);

  const onPress = () => {
    hapticImpact('light');
    toggle();
  };

  const knobTranslateX = knobPos.interpolate({
    inputRange: [0, 1],
    outputRange: [2, dim.pill - dim.knob - 2],
  });

  const sunOpacity = knobPos.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const moonOpacity = knobPos.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={({ pressed }) => [
        styles.pill,
        {
          width: dim.pill,
          height: dim.knob + 6,
          borderRadius: (dim.knob + 6) / 2,
          backgroundColor: isDark ? colors.surfaceAlt : colors.primaryLight,
          borderColor: isDark ? colors.border : 'transparent',
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {/* Sun icon (left, visible in light mode) */}
      <Animated.View
        style={[
          styles.iconLeft,
          { opacity: sunOpacity, width: dim.icon, height: dim.icon },
        ]}
        pointerEvents="none"
      >
        <Sun size={dim.icon} color={colors.primary700} strokeWidth={2.5} />
      </Animated.View>

      {/* Moon icon (right, visible in dark mode) */}
      <Animated.View
        style={[
          styles.iconRight,
          { opacity: moonOpacity, width: dim.icon, height: dim.icon },
        ]}
        pointerEvents="none"
      >
        <Moon size={dim.icon} color={colors.primary300} strokeWidth={2.5} />
      </Animated.View>

      {/* Sliding knob */}
      <Animated.View
        style={[
          styles.knob,
          {
            width: dim.knob,
            height: dim.knob,
            borderRadius: dim.knob / 2,
            backgroundColor: isDark ? colors.primary : '#FFFFFF',
            transform: [{ translateX: knobTranslateX }],
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 4,
          },
        ]}
        pointerEvents="none"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    borderWidth: 1,
  },
  knob: {
    position: 'absolute',
    top: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    position: 'absolute',
    left: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRight: {
    position: 'absolute',
    right: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ThemeToggle;
