import { useEffect, useRef, useState } from "react";
import { useSettingsStore } from "@/features/settings/context/settings-context";
import { useExchangeStore } from "../store/exchange-store";
import { getSanitizedClipboardAmount } from "../utils/paste-utils";

export function usePasteAmount() {
  const setAmountValue = useExchangeStore((s) => s.setAmountValue);
  const decimalSeparator = useSettingsStore((s) => s.decimalSeparator);
  const [pastedStatus, setPastedStatus] = useState<"idle" | "success" | "empty">("idle");
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    },
    [],
  );

  const scheduleStatusReset = () => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    resetTimeoutRef.current = setTimeout(() => {
      resetTimeoutRef.current = null;
      setPastedStatus("idle");
    }, 1500);
  };

  const handlePaste = async () => {
    const sanitizedAmount = await getSanitizedClipboardAmount(decimalSeparator);
    const pastedValue = sanitizedAmount === null ? Number.NaN : Number(sanitizedAmount);

    if (Number.isFinite(pastedValue)) {
      // The clipboard yields a canonical dot-decimal string; it enters as a *value* so the keypad
      // re-encodes it into a buffer the delete key can walk back one character at a time.
      setAmountValue(pastedValue);
      setPastedStatus("success");
      scheduleStatusReset();
      return true;
    }

    setPastedStatus("empty");
    scheduleStatusReset();
    return false;
  };

  return {
    handlePaste,
    pastedStatus,
  };
}
