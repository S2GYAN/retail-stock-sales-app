import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text } from 'react-native';
import DailyEntryScreen from '../screens/DailyEntryScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MonthlySummaryScreen from '../screens/MonthlySummaryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import { ecg } from '../theme/theme';
import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_ICONS: Record<keyof RootTabParamList, string> = {
  Dashboard: '◧',
  DailyEntry: '+',
  Transactions: '≡',
  MonthlySummary: '▦',
  Settings: '⚙',
};

const TAB_LABELS: Record<keyof RootTabParamList, string> = {
  Dashboard: 'Dashboard',
  DailyEntry: 'Daily Entry',
  Transactions: 'Transactions',
  MonthlySummary: 'Summary',
  Settings: 'Settings',
};

const SCREEN_TITLES: Record<keyof RootTabParamList, string> = {
  Dashboard: 'Dashboard',
  DailyEntry: 'Daily Entry',
  Transactions: 'Transactions',
  MonthlySummary: 'Monthly Summary',
  Settings: 'Settings',
};

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        title: SCREEN_TITLES[route.name],
        // ECG livery lives on the chrome only; screen backgrounds stay neutral
        // so figures keep their contrast and the WHT/balance accents keep
        // their meaning.
        headerStyle: {
          backgroundColor: ecg.blue,
          // A gold rule under the header, the one place the second brand
          // colour carries weight.
          borderBottomWidth: 3,
          borderBottomColor: ecg.gold,
        },
        headerTintColor: ecg.onBlue,
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerShadowVisible: false,
        tabBarActiveTintColor: ecg.gold,
        tabBarInactiveTintColor: ecg.onBlueMuted,
        tabBarStyle: {
          backgroundColor: ecg.blue,
          borderTopColor: ecg.blueDark,
        },
        tabBarLabel: TAB_LABELS[route.name],
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size, fontWeight: '700' }}>{TAB_ICONS[route.name]}</Text>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="DailyEntry" component={DailyEntryScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="MonthlySummary" component={MonthlySummaryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
