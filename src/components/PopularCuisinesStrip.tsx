import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/store/theme';
import { Pressable as SafePressable } from '@/components/SafePressable';

const CUISINES = [
  { name: 'Biryani', emoji: '🍛', color: '#FF6B35' },
  { name: 'Pizza', emoji: '🍕', color: '#FF4757' },
  { name: 'Burgers', emoji: '🍔', color: '#FFA502' },
  { name: 'North Indian', emoji: '🍲', color: '#E67E22' },
  { name: 'South Indian', emoji: '🥞', color: '#2ECC71' },
  { name: 'Chinese', emoji: '🥡', color: '#E74C3C' },
  { name: 'Desserts', emoji: '🍰', color: '#EC4899' },
  { name: 'Beverages', emoji: '🥤', color: '#3498DB' },
  { name: 'Healthy', emoji: '🥗', color: '#27AE60' },
  { name: 'Continental', emoji: '🍝', color: '#9B59B6' },
  { name: 'Mughlai', emoji: '🍗', color: '#D35400' },
  { name: 'Street Food', emoji: '🌮', color: '#F39C12' },
];

/**
 * Popular Cuisines horizontal strip — circular emoji tiles with labels.
 * Tapping a cuisine routes to search with that cuisine as the query.
 * Inspired by reference app recordings (food delivery app).
 */
export function PopularCuisinesStrip() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <View style={{ marginTop: 14 }}>
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '800' }}>
          Popular Cuisines
        </Text>
        <SafePressable onPress={() => router.push('/(tabs)/categories')}>
          <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>See all</Text>
        </SafePressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingRight: 16 }}
      >
        {CUISINES.map((cuisine) => (
          <SafePressable
            key={cuisine.name}
            onPress={() => router.push(`/search?q=${encodeURIComponent(cuisine.name)}`)}
            style={{ alignItems: 'center', marginRight: 14, width: 72 }}
          >
            <View style={{
              width: 60, height: 60, borderRadius: 30,
              backgroundColor: colors.surfaceElevated,
              borderWidth: 1, borderColor: colors.border,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 28 }}>{cuisine.emoji}</Text>
            </View>
            <Text style={{
              color: colors.text, fontSize: 11, fontWeight: '600',
              marginTop: 6, textAlign: 'center',
            }} numberOfLines={1}>
              {cuisine.name}
            </Text>
          </SafePressable>
        ))}
      </ScrollView>
    </View>
  );
}
