import { useExchangeScreen } from "../hooks/use-exchange-screen";
import { SwapAmountBlock } from "./swap-amount-block";

export function ExchangeOutputBlock() {
  const {
    outputAmountText,
    outputMeta,
    handleCustomRateChange,
    handleOutputCurrencySelect,
    outputOptions,
    outputSelectedOptionId,
    customRate,
    showOutputCustomRateInput,
    conversionDetails,
    outputCopyText,
  } = useExchangeScreen();

  return (
    <SwapAmountBlock
      amount={outputAmountText}
      code={outputMeta.code}
      icon={outputMeta.icon}
      label="Cambio estimado"
      copyText={outputCopyText}
      onCustomRateChange={handleCustomRateChange}
      onCurrencySelect={handleOutputCurrencySelect}
      options={outputOptions}
      selectedOptionId={outputSelectedOptionId}
      customRate={customRate}
      showCustomRateInput={showOutputCustomRateInput}
      symbol={outputMeta.symbol}
    />
  );
}
