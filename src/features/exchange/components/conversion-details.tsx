import { useEffect, useState } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/components/ui/app-text";
import type { ConversionDetail } from "../types";
import { ConversionDetailRow } from "./conversion-detail-row";

type ConversionDetailsProps = {
  details: ConversionDetail[];
  formula?: string;
  style?: StyleProp<ViewStyle>;
};

export function ConversionDetails({ details, formula, style }: ConversionDetailsProps) {
  const [copiedDetailId, setCopiedDetailId] = useState<string | null>(null);

  useEffect(() => {
    if (!copiedDetailId) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setCopiedDetailId(null);
    }, 1600);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [copiedDetailId]);

  if (!details.length) {
    return null;
  }

  return (
    <Animated.View entering={FadeIn.duration(300).springify().damping(20)} exiting={FadeOut.duration(200)}>
      <View style={[styles.conversionDetails, style]}>
        {formula ? (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
            <AppText variant="subtitle" style={styles.conversionFormula} numberOfLines={1}>
              {formula}
            </AppText>
          </Animated.View>
        ) : null}
        {details.map((detail) => (
          <ConversionDetailRow
            key={detail.id}
            detail={detail}
            isCopied={copiedDetailId === detail.id}
            onCopy={() => setCopiedDetailId(detail.id)}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  conversionDetails: {
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  conversionFormula: {
    marginBottom: theme.spacing.xxs,
    paddingHorizontal: theme.spacing.xxs,
  },
}));
