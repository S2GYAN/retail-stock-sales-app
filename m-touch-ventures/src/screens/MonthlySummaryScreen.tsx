import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { useMemo } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import { useData } from '../context/DataContext';
import { RootTabParamList } from '../navigation/types';
import { colors, numericStyle, spacing, typography } from '../theme/theme';
import { MonthlySummary } from '../types';
import { currentMonthISO, formatMonthLabel } from '../utils/date';
import { formatGHS } from '../utils/format';

const COLS = {
  month: 130,
  days: 70,
  purchases: 110,
  sales: 110,
  gross: 110,
  wht: 100,
  net: 120,
  closing: 120,
};
const TABLE_WIDTH = Object.values(COLS).reduce((a, b) => a + b, 0);

export default function MonthlySummaryScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { monthlySummaries } = useData();

  // A "full" month is one that has already closed - i.e. not the month still in progress.
  const closedMonths = useMemo(
    () => monthlySummaries.filter((m) => m.month !== currentMonthISO()),
    [monthlySummaries]
  );

  if (closedMonths.length === 0) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Monthly Summary</Text>
        <Card style={styles.emptyCard}>
          <EmptyState
            title="No full month of data yet"
            message="Keep logging daily entries. Once a calendar month closes, its summary will appear here."
            actionLabel="Go to Daily Entry"
            onAction={() => navigation.navigate('DailyEntry')}
          />
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Monthly Summary</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator style={styles.hScroll}>
        <View style={{ width: TABLE_WIDTH }}>
          <TableHeader />
          <FlatList
            data={closedMonths}
            keyExtractor={(item) => item.month}
            renderItem={({ item }) => <SummaryRow summary={item} />}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function TableHeader() {
  return (
    <View style={styles.tableHeaderRow}>
      <Text style={[styles.headerCell, { width: COLS.month }]}>Month</Text>
      <Text style={[styles.headerCell, styles.numCell, { width: COLS.days }]}>Days</Text>
      <Text style={[styles.headerCell, styles.numCell, { width: COLS.purchases }]}>Purchases</Text>
      <Text style={[styles.headerCell, styles.numCell, { width: COLS.sales }]}>Sales</Text>
      <Text style={[styles.headerCell, styles.numCell, { width: COLS.gross }]}>Gross Comm.</Text>
      <Text style={[styles.headerCell, styles.numCell, { width: COLS.wht }]}>WHT</Text>
      <Text style={[styles.headerCell, styles.numCell, { width: COLS.net }]}>Net Comm.</Text>
      <Text style={[styles.headerCell, styles.numCell, { width: COLS.closing }]}>Closing Bal.</Text>
    </View>
  );
}

function SummaryRow({ summary }: { summary: MonthlySummary }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.cell, { width: COLS.month }]}>{formatMonthLabel(summary.month)}</Text>
      <Text style={[styles.cell, styles.numCell, { width: COLS.days }]}>{summary.daysLogged}</Text>
      <Text style={[styles.cell, styles.numCell, { width: COLS.purchases }]}>{formatGHS(summary.totalPurchase)}</Text>
      <Text style={[styles.cell, styles.numCell, { width: COLS.sales }]}>{formatGHS(summary.totalSales)}</Text>
      <Text style={[styles.cell, styles.numCell, { width: COLS.gross }]}>{formatGHS(summary.totalCommission)}</Text>
      <Text style={[styles.cell, styles.numCell, styles.deductionCell, { width: COLS.wht }]}>
        -{formatGHS(summary.totalWht)}
      </Text>
      <Text style={[styles.cell, styles.numCell, styles.positiveCell, { width: COLS.net }]}>
        {formatGHS(summary.totalNetCommission)}
      </Text>
      <Text style={[styles.cell, styles.numCell, styles.positiveCell, { width: COLS.closing }]}>
        {formatGHS(summary.closingBalance)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.h2,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
});
