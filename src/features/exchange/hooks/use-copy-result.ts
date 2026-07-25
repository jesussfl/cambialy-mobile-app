import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";

export function useCopyResult(resultCopyText: string) {
  const [copiedResultText, setCopiedResultText] = useState<string | null>(null);
  const resultCopied = copiedResultText === resultCopyText;

  const handleCopyResult = async () => {
    await Clipboard.setStringAsync(resultCopyText);
    setCopiedResultText(resultCopyText);
  };

  useEffect(() => {
    if (!copiedResultText) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setCopiedResultText(null);
    }, 1600);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [copiedResultText]);

  return {
    handleCopyResult,
    resultCopied,
  };
}
