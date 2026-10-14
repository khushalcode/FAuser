/**
 * AppFooter — branded footer with trust badges, version, social.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

interface Props {
  version?: string;
}

export function AppFooter({ version = 'v1.1.0' }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.logoRow}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🛒</Text>
        </View>
        <Text style={styles.brandName}>Food Munch</Text>
      </View>
      <Text style={styles.tagline}>fresh. fast. delivered.</Text>

      <View style={styles.trustRow}>
        <View style={styles.trustItem}>
          <Text style={styles.trustEmoji}>🔒</Text>
          <Text style={styles.trustLabel}>100% Secure</Text>
        </View>
        <View style={styles.trustItem}>
          <Text style={styles.trustEmoji}>⚡</Text>
          <Text style={styles.trustLabel}>15 min delivery</Text>
        </View>
        <View style={styles.trustItem}>
          <Text style={styles.trustEmoji}>🛡️</Text>
          <Text style={styles.trustLabel}>Easy refunds</Text>
        </View>
      </View>

      <View style={styles.linksRow}>
        <Text style={styles.link}>About</Text>
        <Text style={styles.linkDot}>·</Text>
        <Text style={styles.link}>Privacy</Text>
        <Text style={styles.linkDot}>·</Text>
        <Text style={styles.link}>Terms</Text>
        <Text style={styles.linkDot}>·</Text>
        <Text style={styles.link}>Help</Text>
      </View>

      <Text style={styles.version}>Food Munch {version} · Made with ❤️ in India</Text>
      <Text style={styles.copy}>© 2026 Food Munch. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 32,
    backgroundColor: '#FAFAFA',
    marginTop: 24,
    marginHorizontal: 0,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoEmoji: { fontSize: 18 },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  tagline: {
    fontSize: 11,
    color: colors.textMuted,
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
    color: colors.textMuted,
    fontWeight: '500',
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  link: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  linkDot: {
    fontSize: 11,
    color: colors.textSubtle,
    marginHorizontal: 6,
  },
  version: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 4,
  },
  copy: {
    fontSize: 10,
    color: colors.textSubtle,
  },
});

export default AppFooter;
