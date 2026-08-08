import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

interface WarningBannerProps {
  message: string;
}

export default function WarningBanner({ message }: WarningBannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 15,
    color: colors.warning,
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.warning,
    lineHeight: 18,
  },
});
