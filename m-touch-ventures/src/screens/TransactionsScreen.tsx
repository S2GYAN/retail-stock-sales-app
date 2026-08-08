import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import MonthFilterField from '../components/MonthFilterField';
import { useData } from '../context/DataContext';
import { RootTabParamList } from '../navigation/types';
import { colors, numericStyle, spacing, typography } from '../theme/theme';
import { DerivedEntry } from '../types';
import { formatDateDisplay } from '../utils/date';
import { formatGHS } from '../utils/format';

const COLS = {
  date: 140,
  purchase: 120,
  commission: 110,
  wht: 105,
  net: 115,
  sales: 120,
  balance: 120,
  actions: 96,
};
const TABLE_WIDTH = Object.values(COLS).reduce((a, b) => a + b, 0);

export default function TransactionsScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { derivedEntries, deleteEntry } = useData();
  const [monthFilter, setMonthFilter] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const months = useMemo(
    () => Array.from(new Set(derivedEntries.map((e) => e.date.slice(0, 7)))),
    [derivedEntries]
  );

  const rows = useMemo(() => {
    const filtered = monthFilter
      ? derivedEntries.filter((e) => e.date.startsWith(monthFilter))
      : derivedEntries;
    // Most recent first.
    return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  }, [derivedEntries, monthFilter]);

  if (derivedEntries.length === 0) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Transactions</Text>
        <Card style={styles.emptyCard}>
          <EmptyState
            title="No entries yet"
            message="Daily entries you save will appear here as a running ledger."
            actionLabel="Add an entry"
            onAction={() => navigation.navigate('DailyEntry')}
          />
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Transactions</Text>
        <MonthFilterField months={months} value={monthFilter} onChange={setMonthFilter} />
      </View>

      {rows.length === 0 ? (
        <Card style={styles.emptyCard}>
          <EmptyState title="No entries this month" message="Try a different month filter." />
        </Card>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator style={styles.hScroll}>
          <View style={{ width: TABLE_WIDTH }}>
            <TableHeader />
            <FlatList
              data={rows}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TransactionRow
                  entry={item}
                  onEdit={() => navigation.navigate('DailyEntry', { editId: item.id })}
                  onDelete={() => setPendingDeleteId(item.id)}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </ScrollView>
      )}

      <ConfirmModal
        visible={pendingDeleteId !== null}
        title="Delete entry?"
        message="This will permanently remove this day's entry. This cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) deleteEntry(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </View>
  );
}

function TableHeader() {
  return (
    <View style={styles.tableHeaderRow}>
      <Text style={[styles.headerCell, { width: COLS.date }]}>Date</Text>
      <Text style={[styles.headerCell, styles.numCell, { width: COLS.purchase }]}>Purchase</Text>
      <Text style={[styles.headerCell, styles.numCell, { width: COLS.commission }]}>Commission</Text>
      <Text style={[styles.headerCell, styles.numCell, { width: COLS.wht }]}>WHT</Text>
      <Text style={[styles.headerCell, styles.numCell, { width: COLS.net }]}>Net Comm.</Text>
      <Text style={[styles.headerCell, styles.numCell, { width: COLS.sales }]}>Sales</Text>
      <Text style={[styles.headerCell, styles.numCell, { width: COLS.balance }]}>Balance</Text>
      <Text style={[styles.headerCell, { width: COLS.actions, textAlign: 'center' }]}>Actions</Text>
    </View>
  );
}

function TransactionRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: DerivedEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.cell, { width: COLS.date }]}>{formatDateDisplay(entry.date)}</Text>
      <Text style={[styles.cell, styles.numCell, { width: COLS.purchase }]}>{formatGHS(entry.purchase)}</Text>
      <Text style={[styles.cell, styles.numCell, { width: COLS.commission }]}>{formatGHS(entry.commission)}</Text>
      <Text style={[styles.cell, styles.numCell, styles.deductionCell, { width: COLS.wht }]}>
        -{formatGHS(entry.wht)}
      </Text>
      <Text style={[styles.cell, styles.numCell, styles.positiveCell, { width: COLS.net }]}>
        {formatGHS(entry.netCommission)}
      </Text>
      <Text style={[styles.cell, styles.numCell, { width: COLS.sales }]}>{formatGHS(entry.sales)}</Text>
      <Text style={[styles.cell, styles.numCell, styles.positiveCell, { width: COLS.balance }]}>
        {formatGHS(entry.balance)}
      </Text>
      <View style={[styles.actionsCell, { width: COLS.actions }]}>
        <Pressable onPress={onEdit} hitSlop={6}>
          <Text style={styles.editAction}>Edit</Text>
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={6}>
          <Text style={styles.deleteAction}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
  },
  hScroll: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
  },
  cell: {
    fontSize: 13,
    color: colors.textPrimary,
    ...numericStyle,
  },
  numCell: {
    textAlign: 'right',
    paddingRight: spacing.sm,
  },
  deductionCell: {
    color: colors.deduction,
  },
  positiveCell: {
    color: colors.accent,
    fontWeight: '700',
  },
  actionsCell: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  editAction: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.purchase,
  },
  deleteAction: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.deduction,
  },
});
