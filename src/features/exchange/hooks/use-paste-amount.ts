import { useState } from "react";
import { useSettingsStore } from "@/features/settings/context/settings-context";
import { useExchangeStore } from "../store/exchange-store";
import { getSanitizedClipboardAmount } from "../utils/paste-utils";

export function usePasteAmount() {
  const setInputAmount = useExchangeStore((s) => s.setInputAmount);
  const decimalSeparator = useSettingsStore((s) => s.decimalSeparator);
  const [pastedStatus, setPastedStatus] = useState<"idle" | "success" | "empty">("idle");

  const handlePaste = async () => {
    const sanitizedAmount = await getSanitizedClipboardAmount(decimalSeparator);
    if (sanitizedAmount) {
      setInputAmount(sanitizedAmount);
      setPastedStatus("success");
      setTimeout(() => setPastedStatus("idle"), 1500);
      return true;
    }

    setPastedStatus("empty");
    setTimeout(() => setPastedStatus("idle"), 1500);
    return false;
  };

  return {
    handlePaste,
    pastedStatus,
  };
}
