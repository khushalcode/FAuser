import { Platform } from 'react-native';
/**
 * SearchBar — search input with vertically-rotating placeholder text.
 *
 * Rotates between several placeholder strings every ~2 seconds, sliding up
 * and fading out then fading the new one in.
 *
 * Two modes:
 *   - readOnly: renders as a Pressable that navigates to /search
 *   - editable: renders a TextInput bound to value/onChangeText
 *
 * The rotating placeholder uses the React Native Animated API.
 */
import React from 'react';
import { Pressable, View, Text, TextInput, StyleSheet, Animated, Easing } from 'react-native';
import { Search } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { useRouter } from 'expo-router';

const ROTATING_PLACEHOLDERS = [
  'Search for biryani',
  'Search for fresh vegetables',
  'Search for cakes & pastries',
  'Search for mithai & sweets'
];

const COLLAPSED_PLACEHOLDER = 'Search for atta, dal, coke and more';

interface Props {
  placeholder?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  autoFocus?: boolean;
  onSubmit?: () => void;
  readOnly?: boolean;
  /** When true, the rotating placeholders are used; otherwise the supplied
   *  placeholder (or default collapsed text) is shown. */
  rotating?: boolean;
  /** When true, show the collapsed-state placeholder. */
  collapsed?: boolean;
}

export function SearchBar({
  placeholder,
  value,
  onChangeText,
  autoFocus,
  onSubmit,
  readOnly,
  rotating = false,
  collapsed = false
}: Props) {
  const router = useRouter();
  const [idx, setIdx] = React.useState(0);
  const slide = React.useRef(new Animated.Value(0)).current; // 0 = visible, 1 = slid up + faded

  React.useEffect(() => {
    if (!rotating) return;
    const interval = setInterval(() => {
      // Slide out, change text, slide back in.
      Animated.timing(slide, {
        toValue: 1,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: Platform.OS !== 'web'
      }).start(() => {
        setIdx((i) => (i + 1) % ROTATING_PLACEHOLDERS.length);
        slide.setValue(2); // start from below
        Animated.timing(slide, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: Platform.OS !== 'web'
        }).start();
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [rotating, slide]);

  const translateY = slide.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -16, 16]
  });
  const opacity = slide.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 0, 0]
  });

  const displayPlaceholder =
    placeholder ?? (collapsed ? COLLAPSED_PLACEHOLDER : undefined);

  return (
    <Pressable
      onPress={() => readOnly && router.push('/search')}
      style={styles.wrap}
      disabled={!readOnly}
    >
      <Search size={17} color={colors.textMuted} strokeWidth={2.4} />
      {readOnly ? (
        <View style={styles.placeholderWrap}>
          {rotating ? (
            <Animated.Text
              style={[
                styles.placeholder,
                {
                  transform: [{ translateY }],
                  opacity
                }
              ]}
              numberOfLines={1}
            >
              {ROTATING_PLACEHOLDERS[idx]}
            </Animated.Text>
          ) : (
            <Text style={styles.placeholder} numberOfLines={1}>
              {displayPlaceholder || 'Search for restaurants, dishes, groceries...'}
            </Text>
          )}
        </View>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
          onSubmitEditing={onSubmit}
          placeholder={displayPlaceholder || 'Search for restaurants, dishes, groceries...'}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          returnKeyType="search"
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border
  },
  placeholderWrap: {
    flex: 1,
    marginLeft: 10,
    height: 18,
    overflow: 'hidden',
    justifyContent: 'center'
  },
  placeholder: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500'
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: colors.text,
    padding: 0
  }
});

export default SearchBar;
