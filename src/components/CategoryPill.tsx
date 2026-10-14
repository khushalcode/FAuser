import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Category } from '@/lib/types';
import { colors } from '@/theme/colors';

interface Props {
  category: Category;
  onPress?: (cat: Category) => void;
  size?: 'sm' | 'md';
}

const EMOJI: Record<string, string> = {
  biryani: '🍚',
  pizza: '🍕',
  burgers: '🍔',
  'north-indian': '🍛',
  'south-indian': '🥞',
  chinese: '🍜',
  desserts: '🍰',
  beverages: '🥤',
  'fruits-vegetables': '🥕',
  'dairy-eggs': '🥛',
  'atta-rice-dal': '🌾',
  snacks: '🍿',
  'packaged-beverages': '🥤',
  'personal-care': '🧴',
  household: '🧹',
  'frozen-foods': '🧊'
};

export function CategoryPill({ category, onPress, size = 'md' }: Props) {
  // Use the loose `group` field (food | grocery) only to pick an accent color.
  // It is NOT used to filter — both groups show together.
  const accent = category.group === 'grocery' ? colors.primary : colors.warning;
  const dim = size === 'sm' ? 'w-16' : 'w-20';

  return (
    <Pressable
      onPress={() => onPress?.(category)}
      className={`${dim} items-center mr-2.5 active:opacity-80`}
    >
      <View
        className="w-16 h-16 rounded-2xl items-center justify-center"
        style={{ backgroundColor: accent + '15' }}
      >
        <Text className="text-3xl">{EMOJI[category.slug] || '📦'}</Text>
      </View>
      <Text
        className="text-textmain text-[11px] font-medium mt-1.5 text-center"
        numberOfLines={2}
        style={{ lineHeight: 14 }}
      >
        {category.name}
      </Text>
    </Pressable>
  );
}

export default CategoryPill;
