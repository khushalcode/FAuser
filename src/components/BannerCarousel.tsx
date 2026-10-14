import React from 'react';
import { View, Text, Pressable, Dimensions, ScrollView, NativeScrollEvent } from 'react-native';
import type { Banner } from '@/lib/types';
import { colors } from '@/theme/colors';

interface Props {
  banners: Banner[];
  onPress?: (b: Banner) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

export function BannerCarousel({ banners, onPress }: Props) {
  const [active, setActive] = React.useState(0);

  const onScroll = (e: NativeScrollEvent) => {
    const idx = Math.round(e.contentOffset.x / CARD_WIDTH);
    if (idx !== active) setActive(idx);
  };

  if (banners.length === 0) return null;

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => onScroll(e.nativeEvent)}
        scrollEventThrottle={200}
      >
        {banners.map((b) => {
          const [c1, c2] = b.gradient || [colors.primary, colors.primaryDark];
          return (
            <Pressable
              key={b.id}
              onPress={() => onPress?.(b)}
              style={{
                width: CARD_WIDTH,
                marginRight: 8,
                marginLeft: 0,
                marginBottom: 8
              }}
              className="rounded-xl2 overflow-hidden active:opacity-90"
            >
              <View
                className="px-5 py-5"
                style={{
                  backgroundColor: c1,
                  backgroundImage: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
                  minHeight: 130
                }}
              >
                <Text className="text-white text-xl font-bold leading-tight">{b.title}</Text>
                {b.subtitle && (
                  <Text className="text-white/90 text-sm mt-1.5" numberOfLines={2}>
                    {b.subtitle}
                  </Text>
                )}
                {b.cta_text && (
                  <View className="self-start mt-3 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}>
                    <Text className="text-white font-semibold text-xs">{b.cta_text}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="flex-row justify-center mt-1">
        {banners.map((_, i) => (
          <View
            key={i}
            className="h-1.5 rounded-full mx-0.5"
            style={{
              width: i === active ? 18 : 6,
              backgroundColor: i === active ? colors.primary : colors.border
            }}
          />
        ))}
      </View>
    </View>
  );
}

export default BannerCarousel;
