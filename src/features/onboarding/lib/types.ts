export type OnboardingIllustration = "converter" | "compare" | "rates";

export type OnboardingSlide = {
  accentColor: string;
  bgColor: string;
  illustration: OnboardingIllustration;
  subtitle: string;
  title: string;
};

export type IllustrationProps = {
  accentColor: string;
};
