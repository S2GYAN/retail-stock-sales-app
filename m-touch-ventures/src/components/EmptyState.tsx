import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/theme';
import PrimaryButton from './PrimaryButton';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  button: {
    marginTop: spacing.lg,
  },
});
