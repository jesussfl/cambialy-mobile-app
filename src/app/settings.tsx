import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/components/ui/app-text';
import { appTheme as theme } from '@/theme/app-theme';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.content}>
        <AppText variant="title" style={styles.title}>Ajustes</AppText>

        <View style={styles.section}>
          <AppText variant="sectionTitle" style={styles.sectionHeader}>Acerca de la aplicación</AppText>
          <View style={styles.card}>
            <AppText variant="body" style={styles.description}>
              Paga Claro te ayuda a comparar y calcular de manera rápida y transparente tus opciones de pago, asegurando decisiones financieras más claras.
            </AppText>
          </View>
        </View>

        <View style={styles.section}>
          <AppText variant="sectionTitle" style={styles.sectionHeader}>Privacidad y Datos</AppText>
          <View style={styles.card}>
            <AppText variant="body" style={styles.privacyText}>
              Valoramos tu privacidad. No recopilamos, almacenamos ni compartimos ningún tipo de información personal o datos financieros. Todos los cálculos se realizan localmente en tu dispositivo.
            </AppText>
          </View>
        </View>

        <View style={styles.footer}>
          <AppText variant="label" style={styles.versionText}>Versión 1.0.0</AppText>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create(() => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing['3xl'],
    gap: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  section: {
    gap: theme.spacing.xs,
  },
  sectionHeader: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingLeft: theme.spacing.xxs,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  description: {
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeight.sm,
  },
  privacyText: {
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.sm,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  versionText: {
    color: theme.colors.textMuted,
  },
}));

