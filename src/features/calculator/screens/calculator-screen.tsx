import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppTextField } from '@/components/ui/text-field';
import { appTheme as theme } from '@/theme/app-theme';

import { RateCard } from '../components/rate-card';
import { mockRates } from '../data/mock-rates';

export function CalculatorScreen() {
  const [usdValue, setUsdValue] = useState('10.00');
  const [vesValue, setVesValue] = useState('5,445.80');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={styles.header}>
          <AppText variant="title">Paga Claro</AppText>
          <AppText variant="subtitle">Compara precios en bolivares y divisas</AppText>
        </View>

        <View style={styles.ratesSection}>
          <AppText variant="sectionTitle" style={styles.centeredTitle}>
            Precios de hoy
          </AppText>

          <View style={styles.rateGrid}>
            {mockRates.map((rate) => (
              <RateCard key={rate.id} label={rate.label} value={rate.value} icon={rate.icon} />
            ))}
          </View>
        </View>

        <Card elevated style={styles.formCard}>
          <AppText variant="cardTitle">Ingresa los precios a comparar</AppText>

          <View style={styles.formFields}>
            <AppTextField
              label="Precio en Divisa (USD)"
              value={usdValue}
              onChangeText={setUsdValue}
              keyboardType="decimal-pad"
              autoCapitalize="none"
              autoCorrect={false}
              icon={{ ios: 'dollarsign.square', android: 'attach_money' }}
            />

            <AppTextField
              label="Precio en Bolívares (Bs.)"
              value={vesValue}
              onChangeText={setVesValue}
              keyboardType="decimal-pad"
              autoCapitalize="none"
              autoCorrect={false}
              prefix="Bs."
            />
          </View>

          <AppButton label="Cambiar a dolares (BCV)" variant="secondary" />
          <AppButton label="Calcular" variant="primary" />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create(() => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backgroundGlowTop: {
    position: 'absolute',
    top: -140,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: theme.colors.backgroundAccent,
    opacity: 0.32,
  },
  backgroundGlowBottom: {
    position: 'absolute',
    right: -120,
    bottom: 120,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.backgroundAccent,
    opacity: 0.22,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing['3xl'],
    paddingBottom: theme.spacing['3xl'],
    gap: theme.spacing['3xl'],
  },
  header: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
  },
  ratesSection: {
    gap: theme.spacing.lg,
  },
  centeredTitle: {
    textAlign: 'center',
  },
  rateGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  formCard: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  formFields: {
    gap: theme.spacing.xl,
  },
}));
