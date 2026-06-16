import { useExchangeScreen } from "../hooks/use-exchange-screen";
import { SwapAmountBlock } from "./swap-amount-block";

export function ExchangeInputBlock() {
  const {
    inputAmountText,
    inputMeta,
    handleInputAmountChange,
    handleCustomRateChange,
    handleInputCurrencySelect,
    setInputAmount,
    inputOptions,
    quickAmounts,
    customRate,
    showInputCustomRateInput,
    customRateHint,
    selectedBaseRateHint,
    inputSelectedOptionId,
  } = useExchangeScreen();

  return (
    <SwapAmountBlock
      amount={inputAmountText}
      code={inputMeta.code}
      editable
      icon={inputMeta.icon}
      label="Monto"
      onAmountChange={handleInputAmountChange}
      onCustomRateChange={handleCustomRateChange}
      onCurrencySelect={handleInputCurrencySelect}
      onQuickAmountSelect={setInputAmount}
      options={inputOptions}
      quickAmounts={quickAmounts}
      customRate={customRate}
      showCustomRateInput={showInputCustomRateInput}
      supportingHint={showInputCustomRateInput ? customRateHint : selectedBaseRateHint}
      selectedOptionId={inputSelectedOptionId}
      symbol={inputMeta.symbol}
    />
  );
}
