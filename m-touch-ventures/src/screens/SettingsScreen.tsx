import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import ConfirmModal from '../components/ConfirmModal';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import SectionHeader from '../components/SectionHeader';
import { useData } from '../context/DataContext';
import { colors, spacing, typography } from '../theme/theme';
import { DEFAULT_SETTINGS } from '../types';

export default function SettingsScreen() {
  const { settings, updateSettings, resetAll } = useData();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [openingBalanceText, setOpeningBalanceText] = useState(String(settings.openingBalance));
  const [thresholdText, setThresholdText] = useState(String(settings.lowBalanceThreshold));

  const [businessNameError, setBusinessNameError] = useState<string | undefined>();
  const [openingBalanceError, setOpeningBalanceError] = useState<string | undefined>();
  const [thresholdError, setThresholdError] = useState<string | undefined>();

  const [savedMessageVisible, setSavedMessageVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);

  // Keep the form in sync if settings change elsewhere (e.g. after a reset).
  useEffect(() => {
    setBusinessName(settings.businessName);
    setOpeningBalanceText(String(settings.openingBalance));
    setThresholdText(String(settings.lowBalanceThreshold));
  }, [settings]);

  const handleSave = async () => {
    let hasError = false;

    const trimmedName = businessName.trim();
    if (!trimmedName) {
      setBusinessNameError('Business name is required');
      hasError = true;
    } else {
      setBusinessNameError(undefined);
    }

    const openingBalance = parseFloat(openingBalanceText);
    const openingBalanceValid = openingBalanceText.trim() !== '' && Number.isFinite(openingBalance) && openingBalance >= 0;
    if (!openingBalanceValid) {
      setOpeningBalanceError('Enter a valid amount ≥ 0');
      hasError = true;
    } else {
      setOpeningBalanceError(undefined);
    }

    const threshold = parseFloat(thresholdText);
    const thresholdValid = thresholdText.trim() !== '' && Number.isFinite(threshold) && threshold >= 0;
    if (!thresholdValid) {
      setThresholdError('Enter a valid amount ≥ 0');
      hasError = true;
    } else {
      setThresholdError(undefined);
    }

    if (hasError) return;

    await updateSettings({
      businessName: trimmedName,
      openingBalance,
      lowBalanceThreshold: threshold,
    });
    setSavedMessageVisible(true);
    setTimeout(() => setSavedMessageVisible(false), 2000);
  };

  const handleResetConfirmed = async () => {
    setResetModalVisible(false);
    await resetAll();
    setBusinessName(DEFAULT_SETTINGS.businessName);
    setOpeningBalanceText(String(DEFAULT_SETTINGS.openingBalance));
    setThresholdText(String(DEFAULT_SETTINGS.lowBalanceThreshold));
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Settings</Text>

        <Card>
          <SectionHeader title="Business" />
          <FormField
            label="Business name"
            value={businessName}
            onChangeText={setBusinessName}
            error={businessNameError}
            placeholder="M-Touch Ventures"
          />
          <FormField
            label="Opening float balance"
            prefix="GH₵"
            keyboardType="decimal-pad"
            value={openingBalanceText}
            onChangeText={setOpeningBalanceText}
            error={openingBalanceError}
            tabularNumbers
            placeholder="0.00"
          />
          <FormField
            label="Low-balance warning threshold"
            prefix="GH₵"
            keyboardType="decimal-pad"
            value={thresholdText}
            onChangeText={setThresholdText}
            error={thresholdError}
            tabularNumbers
            placeholder="200.00"
          />
          <PrimaryButton label="Save Settings" onPress={handleSave} />
          {savedMessageVisible ? <Text style={styles.savedMessage}>Settings saved.</Text> : null}
        </Card>

        <Card>
          <SectionHeader title="Danger zone" />
          <Text style={styles.dangerDescription}>
            This permanently deletes every daily entry and restores default settings. This cannot be
            undone.
          </Text>
          <PrimaryButton
            label="Reset All Data"
            variant="danger"
            onPress={() => setResetModalVisible(true)}
          />
        </Card>
      </ScrollView>

      <ConfirmModal
        visible={resetModalVisible}
        title="Reset all data?"
        message="All daily entries will be deleted and settings restored to their defaults. This cannot be undone."
        confirmLabel="Reset Everything"
        onCancel={() => setResetModalVisible(false)}
        onConfirm={handleResetConfirmed}
      />
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
  savedMessage: {
    marginTop: spacing.sm,
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  dangerDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
});
