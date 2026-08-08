import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, numericStyle, radius, spacing } from '../theme/theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  prefix?: string;
  tabularNumbers?: boolean;
}

export default function FormField({ label, error, prefix, tabularNumbers, style, ...rest }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          style={[styles.input, tabularNumbers ? numericStyle : null, style]}
          placeholderTextColor={colors.textMuted}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  inputRowError: {
    borderColor: colors.danger,
  },
  prefix: {
    fontSize: 15,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  error: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
