/**
 * AppFooter — branded footer with trust badges, version, social.
 *
 * Dark-mode aware — surfaces, borders, text colours all adapt.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/store/theme';

interface Props {
  version?: string;
}

export function AppFooter({ version = 'v1.1.0' }: Props) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
        },
      ]}
    >
      <View style={styles.logoRow}>
        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
          <Text style={styles.logoEmoji}>🛒</Text>
        </View>
        <Text style={[styles.brandName, { color: colors.text }]}>Food Munch</Text>
      </View>
      <Text style={[styles.tagline, { color: colors.textMuted }]}>
        fresh. fast. delivered.
      </Text>

      <View style={styles.trustRow}>
        <View style={styles.trustItem}>
          <Text style={styles.trustEmoji}>🔒</Text>
          <Text style={[styles.trustLabel, { color: colors.textMuted }]}>
            100% Secure
          </Text>
        </View>
        <View style={styles.trustItem}>
          <Text style={styles.trustEmoji}>⚡</Text>
          <Text style={[styles.trustLabel, { color: colors.textMuted }]}>
            15 min delivery
          </Text>
        </View>
        <View style={styles.trustItem}>
          <Text style={styles.trustEmoji}>🛡️</Text>
          <Text style={[styles.trustLabel, { color: colors.textMuted }]}>
            Easy refunds
          </Text>
        </View>
      </View>

      <View style={styles.linksRow}>
        <Text style={[styles.link, { color: colors.primary }]}>About</Text>
        <Text style={[styles.linkDot, { color: colors.textSubtle }]}>·</Text>
        <Text style={[styles.link, { color: colors.primary }]}>Privacy</Text>
        <Text style={[styles.linkDot, { color: colors.textSubtle }]}>·</Text>
        <Text style={[styles.link, { color: colors.primary }]}>Terms</Text>
        <Text style={[styles.linkDot, { color: colors.textSubtle }]}>·</Text>
        <Text style={[styles.link, { color: colors.primary }]}>Help</Text>
      </View>

      <Text style={[styles.version, { color: colors.textMuted }]}>
        Food Munch {version} · Made with ❤️ in India
      </Text>
      <Text style={[styles.copy, { color: colors.textSubtle }]}>
        © 2026 Food Munch. All rights reserved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 32,
    marginTop: 24,
    marginHorizontal: 0,
    borderTopWidth: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoEmoji: { fontSize: 18 },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
  },
  tagline: {
    fontSize: 11,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  trustItem: {
    alignItems: 'center',
  },
  trustEmoji: { fontSize: 16, marginBottom: 2 },
  trustLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  link: {
    fontSize: 11,
    fontWeight: '600',
  },
  linkDot: {
    fontSize: 11,
    marginHorizontal: 6,
  },
  version: {
    fontSize: 10,
    marginBottom: 4,
  },
  copy: {
    fontSize: 10,
  },
});

export default AppFooter;
