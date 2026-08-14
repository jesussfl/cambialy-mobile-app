import type { ComponentType } from "react";

import type { IllustrationProps, OnboardingIllustration } from "../../lib/types";
import { CompareIllustration } from "./compare-illustration";
import { ConverterIllustration } from "./converter-illustration";
import { RatesIllustration } from "./rates-illustration";

/**
 * Total map from slide kind to illustration. Adding a kind is a new file plus
 * one entry here — `SlideItem` never changes, and TypeScript fails the build if
 * an entry is missing instead of silently falling through to a default.
 */
export const ILLUSTRATIONS: Record<OnboardingIllustration, ComponentType<IllustrationProps>> = {
  compare: CompareIllustration,
  converter: ConverterIllustration,
  rates: RatesIllustration,
};
