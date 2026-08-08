import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';
import { formatMonthLabel } from '../utils/date';

interface MonthFilterFieldProps {
  months: string[]; // YYYY-MM, any order
  value: string | null; // null = all months
  onChange: (month: string | null) => void;
}

export default function MonthFilterField({ months, value, onChange }: MonthFilterFieldProps) {
  const [visible, setVisible] = useState(false);
  const sortedMonths = [...months].sort((a, b) => b.localeCompare(a));
  const label = value ? formatMonthLabel(value) : 'All months';

  return (
    <View>
      <Pressable style={styles.field} onPress={() => setVisible(true)}>
        <Text style={styles.fieldText}>{label}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>Filter by month</Text>
            <FlatList
              data={[null, ...sortedMonths]}
              keyExtractor={(item) => item ?? 'all'}
              style={styles.list}
              renderItem={({ item }) => {
                const isSelected = item === value;
                return (
                  <Pressable
                    style={[styles.option, isSelected ? styles.optionSelected : null]}
                    onPress={() => {
                      onChange(item);
                      setVisible(false);
                    }}
                  >
                    <Text style={[styles.optionText, isSelected ? styles.optionTextSelected : null]}>
                      {item ? formatMonthLabel(item) : 'All months'}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  fieldText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 32, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  optionSelected: {
    backgroundColor: colors.accentSoft,
  },
  optionText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
});
