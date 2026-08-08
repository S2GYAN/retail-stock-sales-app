import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const backgroundColor =
    variant === 'primary'
      ? colors.accent
      : variant === 'danger'
      ? colors.deduction
      : colors.surface;
  const textColor = variant === 'secondary' ? colors.textPrimary : '#FFFFFF';
  const borderColor = variant === 'secondary' ? colors.border : backgroundColor;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
});
