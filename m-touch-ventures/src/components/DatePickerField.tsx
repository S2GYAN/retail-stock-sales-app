import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, numericStyle, radius, spacing } from '../theme/theme';
import { fromISO, isFutureDate, formatDateDisplay, toISO } from '../utils/date';

interface DatePickerFieldProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (iso: string) => void;
  disableFutureDates?: boolean;
}

const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DatePickerField({ label, value, onChange, disableFutureDates }: DatePickerFieldProps) {
  const [visible, setVisible] = useState(false);
  const selected = fromISO(value);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const openPicker = () => {
    const d = fromISO(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setVisible(true);
  };

  const weeks = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const iso = toISO(new Date(viewYear, viewMonth, day));
    if (disableFutureDates && isFutureDate(iso)) return;
    onChange(iso);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={openPicker}>
        <Text style={styles.fieldValue}>{formatDateDisplay(value)}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.calendarCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.calendarHeader}>
              <Pressable onPress={goToPrevMonth} hitSlop={8} style={styles.navButton}>
                <Text style={styles.navButtonText}>‹</Text>
              </Pressable>
              <Text style={styles.monthLabel}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>
              <Pressable onPress={goToNextMonth} hitSlop={8} style={styles.navButton}>
                <Text style={styles.navButtonText}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAY_HEADERS.map((wd, i) => (
                <Text key={i} style={styles.weekdayHeader}>
                  {wd}
                </Text>
              ))}
            </View>

            {weeks.map((week, wi) => (
              <View key={wi} style={styles.weekRow}>
                {week.map((day, di) => {
                  if (day === null) return <View key={di} style={styles.dayCell} />;
                  const iso = toISO(new Date(viewYear, viewMonth, day));
                  const isSelected = iso === value;
                  const isDisabled = Boolean(disableFutureDates && isFutureDate(iso));
                  return (
                    <Pressable
                      key={di}
                      style={[
                        styles.dayCell,
                        isSelected ? styles.dayCellSelected : null,
                      ]}
                      disabled={isDisabled}
                      onPress={() => handleSelectDay(day)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelected ? styles.dayTextSelected : null,
                          isDisabled ? styles.dayTextDisabled : null,
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            <Pressable
              style={styles.todayButton}
              onPress={() => {
                const iso = toISO(new Date());
                onChange(iso);
                setVisible(false);
              }}
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/** Builds a month grid (weeks of 7), with null padding before day 1 and after the last day. */
function buildCalendarGrid(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
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
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  fieldValue: {
    fontSize: 16,
    color: colors.textPrimary,
    ...numericStyle,
  },
  chevron: {
    color: colors.textMuted,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 32, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  navButtonText: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weekdayHeader: {
    width: 36,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  dayCell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  dayCellSelected: {
    backgroundColor: colors.accent,
  },
  dayText: {
    fontSize: 13,
    color: colors.textPrimary,
    ...numericStyle,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextDisabled: {
    color: colors.textMuted,
    opacity: 0.4,
  },
  todayButton: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  todayButtonText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 13,
  },
});
