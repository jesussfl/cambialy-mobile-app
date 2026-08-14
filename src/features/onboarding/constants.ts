import type { OnboardingSlide } from "./lib/types";

export const DEV_SHOW_ONBOARDING_EVERY_LAUNCH = false;

/**
 * Slide illustrations always render on a fixed-color card, never on the app
 * surface, so their ink is deliberately not theme-driven.
 */
export const ILLUSTRATION_INK = "#07101F";

/**
 * Geometry of the pagination bar. The active bar occupies `activeWidthRatio`
 * slots while every other bar occupies one, so the row always sums to the
 * available width regardless of how many slides exist.
 */
export const PAGINATION = {
  gap: 3,
  horizontalInsetRatio: 0.25,
  activeWidthRatio: 3,
} as const;

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    title: "Calcula cambios sin perder tiempo",
    subtitle: "Convierte montos entre divisas y bolivares con tasas listas para comparar.",
    bgColor: "#004FFB",
    accentColor: "#9BFF2A",
    illustration: "converter",
  },
  {
    title: "Compara precios con claridad",
    subtitle: "Revisa si un precio en BCV, USDT, EUR o VES te conviene antes de pagar.",
    bgColor: "#07101F",
    accentColor: "#38D5FF",
    illustration: "compare",
  },
  {
    title: "Ten el dato a mano",
    subtitle: "Consulta tasas actualizadas y cambia de referencia en pocos toques.",
    bgColor: "#0F7A4D",
    accentColor: "#DFFF73",
    illustration: "rates",
  },
];
