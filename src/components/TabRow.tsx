/**
 * TabRow — scrollable tab bar with animated underline indicator.
 *
 * Tabs (Food Munch):
 *   - "All", "Restaurants", "Grocery", "Sweets", "Bakery"
 *
 * The active tab is highlighted with a bold label + an animated underline
 * that re-renders on the newly active tab. Tapping a tab fires onChange —
 * the parent controls the colour blend and content crossfade.
 */
import React from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView
} from 'react-native';
import { colors } from '@/theme/colors';

export interface TabItem {
  key: string;
  label: string;
}

interface Props {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  /** Active tab text colour — defaults to primary. */
  activeColor?: string;
}

export function TabRow({ tabs, active, onChange, activeColor }: Props) {
  const color = activeColor || colors.primary;

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {tabs.map((t) => {
          const isActive = t.key === active;
          return (
            <Pressable
              key={t.key}
              onPress={() => onChange(t.key)}
              style={styles.tab}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? color : colors.textMuted,
                    fontWeight: isActive ? '800' : '600'
                  }
                ]}
              >
                {t.label}
              </Text>
              <View
                style={[
                  styles.underline,
                  {
                    backgroundColor: color,
                    opacity: isActive ? 1 : 0
                  }
                ]}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff'
  },
  content: {
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'relative',
    alignItems: 'center'
  },
  tabText: {
    fontSize: 13,
    letterSpacing: -0.1
  },
  underline: {
    position: 'absolute',
    bottom: 4,
    left: 14,
    right: 14,
    height: 3,
    borderRadius: 2
  }
});

export default TabRow;
