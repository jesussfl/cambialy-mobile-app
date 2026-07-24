import { Switch, View } from "react-native";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { Card } from "@/components/ui/card";
import { UniRemixIcon } from "@/components/ui/icon";
import { useThemePreference } from "@/theme/theme-preference";

const UniSwitch = withUnistyles(Switch);

export function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useThemePreference();

  return (
    <View style={styles.content}>
      <AppText variant="title" style={styles.title}>
        Ajustes
      </AppText>

      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionHeader}>
          Apariencia
        </AppText>
        <Card style={styles.card}>
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceCopy}>
              <View style={styles.preferenceTitleRow}>
                <UniRemixIcon
                  name={isDarkMode ? "moon-line" : "sun-line"}
                  size={20}
                  uniProps={(theme: any) => ({
                    color: theme.colors.primary,
                  })}
                />
                <AppText variant="body" style={styles.preferenceTitle}>
                  Modo oscuro
                </AppText>
              </View>
              <AppText variant="subtitle" style={styles.preferenceDescription}>
                {isDarkMode ? "La app usa el tema oscuro." : "La app usa el tema claro."}
              </AppText>
            </View>
            <UniSwitch
              accessibilityLabel="Cambiar modo oscuro"
              onValueChange={() => {
                void toggleTheme();
              }}
              uniProps={(theme) => ({
                thumbColor: isDarkMode ? theme.colors.primaryText : theme.colors.surface,
                trackColor: {
                  false: theme.colors.secondarySurface,
                  true: theme.colors.primary,
                },
              })}
              value={isDarkMode}
            />
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionHeader}>
          Acerca de la aplicación
        </AppText>
        <Card style={styles.card}>
          <AppText variant="body" style={styles.description}>
            Cambialy te ayuda a comparar y calcular de manera rápida y transparente tus opciones de pago, asegurando decisiones financieras más claras.
          </AppText>
        </Card>
      </View>

      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionHeader}>
          Privacidad y Datos
        </AppText>
        <Card style={styles.card}>
          <AppText variant="body" style={styles.privacyText}>
            Valoramos tu privacidad. No recopilamos, almacenamos ni compartimos ningún tipo de información personal o datos financieros. Todos los cálculos se
            realizan localmente en tu dispositivo.
          </AppText>
        </Card>
      </View>

      <View style={styles.footer}>
        <AppText variant="label" style={styles.versionText}>
          Versión 1.0.0
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: rt.insets.top,
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
    textTransform: "uppercase",
    letterSpacing: 0,
    paddingLeft: theme.spacing.xxs,
  },
  card: {
    padding: theme.spacing.md,
  },
  preferenceRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  preferenceCopy: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xxs,
  },
  preferenceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  preferenceTitle: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  preferenceDescription: {
    color: theme.colors.textSecondary,
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
    marginTop: "auto",
    alignItems: "center",
    paddingBottom: theme.spacing.xl,
  },
  versionText: {
    color: theme.colors.textMuted,
  },
}));
