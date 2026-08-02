import { ScrollView, Switch, View } from "react-native";
import { TouchZone } from "@/components/ui/button";
import Animated, { FadeOut, ZoomIn } from "react-native-reanimated";
import { StyleSheet, withUnistyles } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import { TopNavbar } from "@/components/ui/top-navbar";
import { Card } from "@/components/ui/card";
import { UniRemixIcon } from "@/components/ui/icon";
import { useSettingsStore } from "@/features/settings/context/settings-context";
import { useThemePreference } from "@/theme/theme-preference";

const UniSwitch = withUnistyles(Switch);

export function SettingsScreen() {
  const { isDarkMode, toggleTheme } = useThemePreference();
  const { amountInputMode, setAmountInputMode, decimalSeparator, setDecimalSeparator } = useSettingsStore();

  return (
    <View style={styles.screenContent}>
      <TopNavbar title="Ajustes" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

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
          Entrada de montos
        </AppText>
        <Card style={styles.card}>
          <TouchZone
            accessibilityRole="radio"
            accessibilityState={{ checked: amountInputMode === "automatic" }}
            style={styles.modeRow}
            onPress={() => void setAmountInputMode("automatic")}
          >
            <View style={styles.modeCopy}>
              <AppText variant="body" style={styles.modeTitle}>
                Automático (centavos)
              </AppText>
              <AppText variant="subtitle" style={styles.modeDescription}>
                23 → 0,23
              </AppText>
            </View>
            {amountInputMode === "automatic" ? <Animated.View entering={ZoomIn.duration(200)} exiting={FadeOut.duration(150)}><UniRemixIcon name="check-line" size={20} uniProps={(theme: any) => ({ color: theme.colors.primary })} /></Animated.View> : null}
          </TouchZone>

          <View style={styles.modeSeparator} />

          <TouchZone
            accessibilityRole="radio"
            accessibilityState={{ checked: amountInputMode === "manual" }}
            style={styles.modeRow}
            onPress={() => void setAmountInputMode("manual")}
          >
            <View style={styles.modeCopy}>
              <AppText variant="body" style={styles.modeTitle}>
                Manual (con coma/punto)
              </AppText>
              <AppText variant="subtitle" style={styles.modeDescription}>
                23 → 23
              </AppText>
            </View>
            {amountInputMode === "manual" ? <Animated.View entering={ZoomIn.duration(200)} exiting={FadeOut.duration(150)}><UniRemixIcon name="check-line" size={20} uniProps={(theme: any) => ({ color: theme.colors.primary })} /></Animated.View> : null}
          </TouchZone>
        </Card>
      </View>

      <View style={styles.section}>
        <AppText variant="sectionTitle" style={styles.sectionHeader}>
          Formato numérico
        </AppText>
        <Card style={styles.card}>
          <TouchZone
            accessibilityRole="radio"
            accessibilityState={{ checked: decimalSeparator === "comma" }}
            style={styles.modeRow}
            onPress={() => void setDecimalSeparator("comma")}
          >
            <View style={styles.modeCopy}>
              <AppText variant="body" style={styles.modeTitle}>
                Coma (1.234,56)
              </AppText>
              <AppText variant="subtitle" style={styles.modeDescription}>
                Separador decimal: coma
              </AppText>
            </View>
            {decimalSeparator === "comma" ? <Animated.View entering={ZoomIn.duration(200)} exiting={FadeOut.duration(150)}><UniRemixIcon name="check-line" size={20} uniProps={(theme: any) => ({ color: theme.colors.primary })} /></Animated.View> : null}
          </TouchZone>

          <View style={styles.modeSeparator} />

          <TouchZone
            accessibilityRole="radio"
            accessibilityState={{ checked: decimalSeparator === "dot" }}
            style={styles.modeRow}
            onPress={() => void setDecimalSeparator("dot")}
          >
            <View style={styles.modeCopy}>
              <AppText variant="body" style={styles.modeTitle}>
                Punto (1,234.56)
              </AppText>
              <AppText variant="subtitle" style={styles.modeDescription}>
                Separador decimal: punto
              </AppText>
            </View>
            {decimalSeparator === "dot" ? <Animated.View entering={ZoomIn.duration(200)} exiting={FadeOut.duration(150)}><UniRemixIcon name="check-line" size={20} uniProps={(theme: any) => ({ color: theme.colors.primary })} /></Animated.View> : null}
          </TouchZone>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  screenContent: {
    paddingTop: rt.insets.top,
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 120,
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
  modeRow: {
    minHeight: 52,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: theme.spacing.md,
  },
  modeCopy: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.xxs,
  },
  modeTitle: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  modeDescription: {
    color: theme.colors.textSecondary,
  },
  modeSeparator: {
    height: 1,
    backgroundColor: theme.colors.secondarySurface,
    marginVertical: theme.spacing.xs,
  },
}));
