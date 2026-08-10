import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useRef } from "react";

/**
 * The single place that drives the amount keypad sheet.
 *
 * Presenting it is a two-step async dance (`dismissAll` then `present`), and the price-comparison
 * screen mounts one sheet per price block — so two rapid taps used to interleave their steps and could
 * leave the wrong sheet showing, or none. Every open is chained onto the previous one so the steps can
 * never overlap.
 */
export function useAmountSheet(name: string) {
  const pendingRef = useRef<Promise<void>>(Promise.resolve());

  const open = (beforePresent?: () => void) => {
    beforePresent?.();

    const present = async () => {
      await TrueSheet.dismissAll();
      await TrueSheet.present(name);
    };

    // Chain on both settle paths so one rejected present cannot wedge the queue.
    pendingRef.current = pendingRef.current.then(present, present);
    return pendingRef.current;
  };

  const close = () => TrueSheet.dismiss(name);

  return { open, close };
}
