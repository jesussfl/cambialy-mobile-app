import type { OnboardingSlide } from "./lib/types";

export const ONBOARDING_STORAGE_KEY = "cambialy:onboarding:v1";

export const DEV_SHOW_ONBOARDING_EVERY_LAUNCH = false;

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    title: "Calcula cambios sin perder tiempo",
    subtitle: "Convierte montos entre divisas y bolivares con tasas listas para comparar.",
    bgColor: "#004FFB",
    accentColor: "#9BFF2A",
    duration: 4200,
    illustration: "converter",
  },
  {
    title: "Compara precios con claridad",
    subtitle: "Revisa si un precio en BCV, USDT, EUR o VES te conviene antes de pagar.",
    bgColor: "#07101F",
    accentColor: "#38D5FF",
    duration: 4200,
    illustration: "compare",
  },
  {
    title: "Ten el dato a mano",
    subtitle: "Consulta tasas actualizadas y cambia de referencia en pocos toques.",
    bgColor: "#0F7A4D",
    accentColor: "#DFFF73",
    duration: 4200,
    illustration: "rates",
  },
];
