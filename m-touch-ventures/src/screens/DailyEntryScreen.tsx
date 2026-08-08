import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import DatePickerField from '../components/DatePickerField';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import SectionHeader from '../components/SectionHeader';
import { useData } from '../context/DataContext';
import { RootTabParamList } from '../navigation/types';
import { colors, numericStyle, spacing, typography } from '../theme/theme';
import { COMMISSION_RATE, WHT_RATE, round2 } from '../utils/calculations';
import { todayISO } from '../utils/date';
import { formatGHS } from '../utils/format';

type DailyEntryRouteProp = RouteProp<RootTabParamList, 'DailyEntry'>;

export default function DailyEntryScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const route = useRoute<DailyEntryRouteProp>();
  const editId = route.params?.editId;

  const { entries, settings, derivedEntries, entryForDate, upsertEntry } = useData();

  const editingEntry = useMemo(() => entries.find((e) => e.id === editId), [entries, editId]);

  const [date, setDate] = useState(editingEntry?.date ?? todayISO());
  const [purchaseText, setPurchaseText] = useState(editingEntry ? String(editingEntry.purchase) : '');
  const [salesText, setSalesText] = useState(editingEntry ? String(editingEntry.sales) : '');
  const [purchaseError, setPurchaseError] = useState<string | undefined>();
  const [salesError, setSalesError] = useState<string | undefined>();

  // If we arrive with an editId, sync the form once the entry is available.
  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date);
      setPurchaseText(String(editingEntry.purchase));
      setSalesText(String(editingEntry.sales));
    }
  }, [editingEntry]);

  // Every time the tab is focused with no editId (i.e. "Daily Entry" pressed fresh,
  // not "edit" from Transactions), reset to today - prefilling from today's entry if
  // one already exists, so the accountant can correct it in place.
  useFocusEffect(
    useCallback(() => {
      if (!editId) {
        const today = todayISO();
        const todaysEntry = entryForDate(today);
        setDate(today);
        setPurchaseText(todaysEntry ? String(todaysEntry.purchase) : '');
        setSalesText(todaysEntry ? String(todaysEntry.sales) : '');
        setPurchaseError(undefined);
        setSalesError(undefined);
      }
    }, [editId, entryForDate])
  );

  const purchase = parseFloat(purchaseText);
  const sales = parseFloat(salesText);
  const purchaseValid = purchaseText.trim() !== '' && Number.isFinite(purchase) && purchase >= 0;
  const salesValid = salesText.trim() !== '' && Number.isFinite(sales) && sales >= 0;

  const existingOnDate = entryForDate(date);
  // A collision with the very entry being edited isn't worth flagging - the
  // screen already reads "Edit Entry". Only warn when saving would fold this
  // into some *other* day's existing entry.
  const willUpdateExisting = Boolean(existingOnDate && existingOnDate.id !== editId);

  const preview = useMemo(() => {
    const p = purchaseValid ? purchase : 0;
    const s = salesValid ? sales : 0;
    const commission = round2(p * COMMISSION_RATE);
    const wht = round2(commission * WHT_RATE);
    const netCommission = round2(commission - wht);

    // Projected balance: previous entry's balance (chronologically before `date`,
    // excluding the entry being edited) plus this entry's purchase - sales.
    // derivedEntries is sorted ascending, so the last match after filtering is the
    // most recent entry strictly before `date`.
    const priorEntries = derivedEntries.filter((e) => e.date < date && e.id !== editId);
    const priorBalance = priorEntries.length > 0
      ? priorEntries[priorEntries.length - 1].balance
      : settings.openingBalance;

    const projectedBalance = round2(priorBalance + p - s);

    return { commission, wht, netCommission, projectedBalance };
  }, [purchase, purchaseValid, sales, salesValid, derivedEntries, date, editId, settings.openingBalance]);

  const handleSave = async () => {
    let hasError = false;
    if (!purchaseValid) {
      setPurchaseError('Enter a valid amount ≥ 0');
      hasError = true;
    } else {
      setPurchaseError(undefined);
    }
    if (!salesValid) {
      setSalesError('Enter a valid amount ≥ 0');
      hasError = true;
    } else {
      setSalesError(undefined);
    }
    if (!date) hasError = true;
    if (hasError) return;

    await upsertEntry({ id: editId, date, purchase, sales });
    navigation.navigate('Transactions');
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{editingEntry ? 'Edit Entry' : 'Daily Entry'}</Text>

        <Card>
          <DatePickerField label="Date" value={date} onChange={setDate} disableFutureDates />

          <FormField
            label="Purchase (GHS)"
            prefix="GH₵"
            keyboardType="decimal-pad"
            placeholder="0.00"
            value={purchaseText}
            onChangeText={setPurchaseText}
            error={purchaseError}
            tabularNumbers
          />

          <FormField
            label="Sales (GHS)"
            prefix="GH₵"
            keyboardType="decimal-pad"
            placeholder="0.00"
            value={salesText}
            onChangeText={setSalesText}
            error={salesError}
            tabularNumbers
          />

          {willUpdateExisting ? (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                An entry already exists for this date. Saving will update it instead of creating a duplicate.
              </Text>
            </View>
          ) : null}
        </Card>

        <Card>
          <SectionHeader title="Preview" />
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Gross commission</Text>
            <Text style={styles.previewValue}>{formatGHS(preview.commission)}</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>WHT (10%)</Text>
            <Text style={[styles.previewValue, styles.deductionText]}>-{formatGHS(preview.wht)}</Text>
          </View>
          <View style={[styles.previewRow, styles.previewRowLast]}>
            <Text style={styles.previewLabelStrong}>Net commission</Text>
            <Text style={styles.previewValueStrong}>{formatGHS(preview.netCommission)}</Text>
          </View>
          <View style={[styles.previewRow, styles.projectedRow]}>
            <Text style={styles.previewLabelStrong}>Projected balance</Text>
            <Text style={styles.projectedValue}>{formatGHS(preview.projectedBalance)}</Text>
          </View>
        </Card>

        <PrimaryButton label="Save" onPress={handleSave} style={styles.saveButton} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h2,
  },
  notice: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.sm,
  },
  noticeText: {
    fontSize: 12,
    color: colors.warning,
    lineHeight: 17,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  previewRowLast: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
  },
  previewLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  previewLabelStrong: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  previewValue: {
    fontSize: 14,
    color: colors.textPrimary,
    ...numericStyle,
  },
  previewValueStrong: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
    ...numericStyle,
  },
  deductionText: {
    color: colors.deduction,
  },
  projectedRow: {
    marginTop: spacing.sm,
  },
  projectedValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    ...numericStyle,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});
