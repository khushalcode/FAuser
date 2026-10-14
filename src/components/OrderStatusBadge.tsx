import React from 'react';
import { View, Text } from 'react-native';
import type { OrderStatus } from '@/lib/types';
import { colors } from '@/theme/colors';
import { orderStatusLabel, orderStatusColor } from '@/utils/format';

interface Props {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export function OrderStatusBadge({ status, size = 'sm' }: Props) {
  const label = orderStatusLabel[status];
  const color = orderStatusColor[status];
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1.5';
  const fontSize = size === 'sm' ? 'text-[11px]' : 'text-xs';

  return (
    <View className={`${padding} rounded-full flex-row items-center`} style={{ backgroundColor: color + '15' }}>
      <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: color }} />
      <Text className={`${fontSize} font-semibold`} style={{ color }}>{label}</Text>
    </View>
  );
}

export default OrderStatusBadge;
