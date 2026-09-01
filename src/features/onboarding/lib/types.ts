export type OnboardingIllustration = "converter" | "compare" | "rates";

export type OnboardingSlide = {
  accentColor: string;
  bgColor: string;
  /** How long the slide stays on screen before auto-advancing, in ms. */
  durationMs: number;
  illustration: OnboardingIllustration;
  subtitle: string;
  title: string;
};

export type IllustrationProps = {
  accentColor: string;
};
