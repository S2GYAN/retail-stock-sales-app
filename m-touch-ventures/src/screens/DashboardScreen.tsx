import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import StatTile from '../components/StatTile';
import WarningBanner from '../components/WarningBanner';
import Legend from '../components/charts/Legend';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import { useData } from '../context/DataContext';
import { colors, numericStyle, spacing, typography } from '../theme/theme';
import { buildDailySeries } from '../utils/calculations';
import { formatDateShort, formatMonthShort, lastNDays, todayISO } from '../utils/date';
import { formatGHS, formatPercentChange } from '../utils/format';
import { RootTabParamList } from '../navigation/types';

export default function DashboardScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { derivedEntries, settings, currentBalance, entryForDate } = useData();

  const today = todayISO();
  const todayEntry = useMemo(() => entryForDate(today), [entryForDate, today]);
  const todayDerived = useMemo(
    () => derivedEntries.find((e) => e.date === today),
    [derivedEntries, today]
  );

  const isLowBalance = currentBalance < settings.lowBalanceThreshold;
  const hasEnoughData = derivedEntries.length >= 2;

  const currentMonthPrefix = today.slice(0, 7);
  const monthEntries = useMemo(
    () => derivedEntries.filter((e) => e.date.startsWith(currentMonthPrefix)),
    [derivedEntries, currentMonthPrefix]
  );
  const monthTotalSales = monthEntries.reduce((sum, e) => sum + e.sales, 0);
  const monthTotalNetCommission = monthEntries.reduce((sum, e) => sum + e.netCommission, 0);

  const last7 = lastNDays(7);
  const prior7 = lastNDays(7, lastNDays(8)[0]);
  const sumSalesFor = (dates: string[]) => {
    const byDate = new Map(derivedEntries.map((e) => [e.date, e]));
    return dates.reduce((sum, d) => sum + (byDate.get(d)?.sales ?? 0), 0);
  };
  const last7Sales = sumSalesFor(last7);
  const prior7Sales = sumSalesFor(prior7);
  const changeLabel = formatPercentChange(last7Sales, prior7Sales);
  const changeIsUp = last7Sales >= prior7Sales;

  const last30Days = lastNDays(30);
  const dailySeries = useMemo(
    () => buildDailySeries(derivedEntries, last30Days, settings.openingBalance),
    [derivedEntries, last30Days, settings.openingBalance]
  );
  const dayLabels = last30Days.map((d, i) => (i % 5 === 0 ? formatDateShort(d) : ''));

  const monthlyChartMonths = useMemo(() => {
    const months = Array.from(new Set(derivedEntries.map((e) => e.date.slice(0, 7)))).sort();
    return months.slice(-6);
  }, [derivedEntries]);

  const monthlyChartData = useMemo(() => {
    return monthlyChartMonths.map((month) => {
      const entries = derivedEntries.filter((e) => e.date.startsWith(month));
      const gross = entries.reduce((sum, e) => sum + e.commission, 0);
      const wht = entries.reduce((sum, e) => sum + e.wht, 0);
      const net = entries.reduce((sum, e) => sum + e.netCommission, 0);
      return { month, gross, wht, net };
    });
  }, [monthlyChartMonths, derivedEntries]);

  if (!hasEnoughData) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.emptyContainer}>
        <Text style={styles.businessName}>{settings.businessName}</Text>
        <Card>
          <EmptyState
            title="Not enough data yet"
            message="Add at least two daily entries to see your dashboard: current float balance, sales trends, and commission charts."
            actionLabel="Add an entry"
            onAction={() => navigation.navigate('DailyEntry')}
          />
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.businessName}>{settings.businessName}</Text>

      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>CURRENT FLOAT BALANCE</Text>
        <Text style={[styles.balanceValue, isLowBalance ? styles.balanceValueLow : null]}>
          {formatGHS(currentBalance)}
        </Text>
      </Card>

      {isLowBalance ? (
        <WarningBanner
          message={`Float balance is below your threshold of ${formatGHS(settings.lowBalanceThreshold)}. Consider topping up.`}
        />
      ) : null}

      <Card>
        <SectionHeader title="Today" />
        {todayDerived ? (
          <View style={styles.statRow}>
            <StatTile label="Sales" value={formatGHS(todayDerived.sales)} />
            <StatTile label="Net commission" value={formatGHS(todayDerived.netCommission)} tone="positive" />
          </View>
        ) : (
          <EmptyState
            title="No entry for today"
            message="You haven't logged today's purchase and sales yet."
            actionLabel="Add today's entry"
            onAction={() => navigation.navigate('DailyEntry')}
          />
        )}
      </Card>

      <Card>
        <SectionHeader title="This month" />
        <View style={styles.statRow}>
          <StatTile label="Total sales" value={formatGHS(monthTotalSales)} />
          <StatTile label="Total net commission" value={formatGHS(monthTotalNetCommission)} tone="positive" />
        </View>
      </Card>

      <Card>
        <SectionHeader title="Last 7 days vs. prior 7 days" />
        <View style={styles.statRow}>
          <StatTile
            label="Last 7 days sales"
            value={formatGHS(last7Sales)}
            sub={`Prior 7 days: ${formatGHS(prior7Sales)}`}
          />
          <StatTile
            label="Change"
            value={changeLabel}
            tone={changeIsUp ? 'positive' : 'deduction'}
          />
        </View>
      </Card>

      <Card>
        <SectionHeader title="Daily sales vs. purchases (last 30 days)" />
        <TimeSeriesChart
          mode="bar"
          xLabels={dayLabels}
          series={[
            { key: 'purchase', color: colors.purchase, values: dailySeries.purchase },
            { key: 'sales', color: colors.sales, values: dailySeries.sales },
          ]}
        />
        <Legend items={[{ label: 'Purchases', color: colors.purchase }, { label: 'Sales', color: colors.sales }]} />
      </Card>

      <Card>
        <SectionHeader title="Float balance trend (last 30 days)" />
        <TimeSeriesChart
          mode="line"
          xLabels={dayLabels}
          series={[{ key: 'balance', color: colors.accent, values: dailySeries.balance }]}
        />
      </Card>

      <Card>
        <SectionHeader title="Monthly commission breakdown" />
        <TimeSeriesChart
          mode="bar"
          xLabels={monthlyChartData.map((m) => formatMonthShort(m.month))}
          series={[
            { key: 'gross', color: colors.purchase, values: monthlyChartData.map((m) => m.gross) },
            { key: 'wht', color: colors.deduction, values: monthlyChartData.map((m) => m.wht) },
            { key: 'net', color: colors.accent, values: monthlyChartData.map((m) => m.net) },
          ]}
        />
        <Legend
          items={[
            { label: 'Gross commission', color: colors.purchase },
            { label: 'WHT', color: colors.deduction },
            { label: 'Net commission', color: colors.accent },
          ]}
        />
      </Card>
    </ScrollView>
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
  },
  emptyContainer: {
    padding: spacing.lg,
    gap: spacing.lg,
    flexGrow: 1,
  },
  businessName: {
    ...typography.h2,
  },
  balanceCard: {
    alignItems: 'flex-start',
  },
  balanceLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.accent,
    ...numericStyle,
  },
  balanceValueLow: {
    color: colors.deduction,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
});
