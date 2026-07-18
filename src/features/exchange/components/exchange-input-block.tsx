import { useExchangeScreen } from "../hooks/use-exchange-screen";
import { SwapAmountBlock } from "./swap-amount-block";

export function ExchangeInputBlock() {
  const {
    inputAmountText,
    inputMeta,
    handleInputAmountChange,
    handleQuickAmountSelect,
    handleCustomRateChange,
    handleInputCurrencySelect,
    inputOptions,
    quickAmounts,
    customRate,
    showInputCustomRateInput,
    inputSelectedOptionId,
  } = useExchangeScreen();

  return (
    <SwapAmountBlock
      amount={inputAmountText}
      code={inputMeta.code}
      editable
      icon={inputMeta.icon}
      onAmountChange={handleInputAmountChange}
      onCustomRateChange={handleCustomRateChange}
      onCurrencySelect={handleInputCurrencySelect}
      onQuickAmountSelect={handleQuickAmountSelect}
      options={inputOptions}
      quickAmounts={quickAmounts}
      customRate={customRate}
      showCustomRateInput={showInputCustomRateInput}
      selectedOptionId={inputSelectedOptionId}
      symbol={inputMeta.symbol}
    />
  );
}
