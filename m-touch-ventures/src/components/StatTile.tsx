import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, numericStyle, spacing } from '../theme/theme';

interface StatTileProps {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'deduction' | 'muted';
  sub?: string;
}

export default function StatTile({ label, value, tone = 'default', sub }: StatTileProps) {
  const valueColor =
    tone === 'positive'
      ? colors.accent
      : tone === 'deduction'
      ? colors.deduction
      : tone === 'muted'
      ? colors.textMuted
      : colors.textPrimary;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    ...numericStyle,
  },
  sub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    ...numericStyle,
  },
});
