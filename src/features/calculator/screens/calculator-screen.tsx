import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { z } from "zod";

import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppTextField } from "@/components/ui/text-field";
import { appTheme as theme } from "@/theme/app-theme";

import { RateCard } from "../components/rate-card";
import { mockRates } from "../data/mock-rates";

const parseCurrencyAmount = (value: string) => {
  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.includes(",") && trimmedValue.includes(".") ? trimmedValue.replace(/,/g, "") : trimmedValue.replace(",", ".");

  return Number(normalizedValue);
};

const currencyAmountSchema = z
  .string()
  .trim()
  .min(1, "Ingresa un precio")
  .refine((value) => Number.isFinite(parseCurrencyAmount(value)), "Ingresa un numero valido")
  .refine((value) => parseCurrencyAmount(value) > 0, "Ingresa un precio mayor a cero");

const calculatorSchema = z.object({
  usdValue: currencyAmountSchema,
  vesValue: currencyAmountSchema,
});

type CalculatorFormValues = z.infer<typeof calculatorSchema>;

export function CalculatorScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorSchema),
  });

  const handleCalculate = (values: CalculatorFormValues) => {
    console.log(values);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
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
            <Controller
              control={control}
              name="usdValue"
              render={({ field: { onBlur, onChange, value } }) => (
                <View style={styles.fieldGroup}>
                  <AppTextField
                    label="Precio en Divisa (USD)"
                    value={value ?? ""}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType="decimal-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    icon={{ ios: "dollarsign.square", android: "attach_money" }}
                  />
                  {errors.usdValue ? (
                    <AppText variant="body" color={theme.colors.error}>
                      {errors.usdValue.message}
                    </AppText>
                  ) : null}
                </View>
              )}
            />

            <Controller
              control={control}
              name="vesValue"
              render={({ field: { onBlur, onChange, value } }) => (
                <View style={styles.fieldGroup}>
                  <AppTextField
                    label="Precio en Bolivares (Bs.)"
                    value={value ?? ""}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType="decimal-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    prefix="Bs."
                  />
                  {errors.vesValue ? (
                    <AppText variant="body" color={theme.colors.error}>
                      {errors.vesValue.message}
                    </AppText>
                  ) : null}
                </View>
              )}
            />
          </View>

          <AppButton label="Cambiar a dolares (BCV)" variant="secondary" />
          <AppButton label="Calcular" variant="primary" onPress={handleSubmit(handleCalculate)} />
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
    position: "absolute",
    top: -140,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: theme.colors.backgroundAccent,
    opacity: 0.32,
  },
  backgroundGlowBottom: {
    position: "absolute",
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
    paddingTop: theme.spacing["3xl"],
    paddingBottom: theme.spacing["3xl"],
    gap: theme.spacing["3xl"],
  },
  header: {
    gap: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
  },
  ratesSection: {
    gap: theme.spacing.lg,
  },
  centeredTitle: {
    textAlign: "center",
  },
  rateGrid: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  formCard: {
    padding: theme.spacing.md,
    gap: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  formFields: {
    gap: theme.spacing.xl,
  },
  fieldGroup: {
    gap: theme.spacing.xs,
  },
}));
