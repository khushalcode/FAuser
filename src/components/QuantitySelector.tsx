import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useThemeColors } from '@/store/theme';
import { hapticImpact } from '@/utils/platform';

interface Props {
  quantity: number;
  onIncrement?: () => void;
  onDecrement?: () => void;
  size?: 'sm' | 'md';
}

export function QuantitySelector({ quantity, onIncrement, onDecrement, size = 'md' }: Props) {
  const colors = useThemeColors();
  const dim = size === 'sm' ? 24 : 30;
  const btn = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';

  if (quantity === 0) {
    return (
      <Pressable
        onPress={() => { hapticImpact('light'); onIncrement?.(); }}
        className={`${btn} rounded-lg items-center justify-center`}
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="font-bold text-sm" style={{ color: '#fff' }}>ADD</Text>
      </Pressable>
    );
  }

  return (
    <View
      className="flex-row items-center rounded-lg overflow-hidden"
      style={{ backgroundColor: colors.primaryLight }}
    >
      <Pressable
        onPress={() => { hapticImpact('light'); onDecrement?.(); }}
        className={`${btn} items-center justify-center`}
      >
        <Minus size={14} color={colors.primaryDark} strokeWidth={3} />
      </Pressable>
      <Text
        className="font-bold"
        style={{ width: dim, textAlign: 'center', fontSize: size === 'sm' ? 12 : 14, color: colors.primaryDark }}
      >
        {quantity}
      </Text>
      <Pressable
        onPress={() => { hapticImpact('light'); onIncrement?.(); }}
        className={`${btn} items-center justify-center`}
      >
        <Plus size={14} color={colors.primaryDark} strokeWidth={3} />
      </Pressable>
    </View>
  );
}

export default QuantitySelector;
