import { getDisplayAmount } from "@/features/exchange/utils";

import { useExchangeContext } from "../context/exchange-context";
import { useExchangeRatesList } from "../hooks/use-exchange-rates-list";
import { useExchangeInput } from "../hooks/use-exchange-input";
import { SwapAmountBlock } from "./swap-amount-block";

export function ExchangeInputBlock() {
  const { selectedBaseRateId, customRateValue } = useExchangeContext((state) => state);
  const { rates, selectedBaseRate } = useExchangeRatesList(selectedBaseRateId, customRateValue);

  const baseRateOptions = rates.map((rate) => rate.info);

  const {
    inputAmount,
    inputCurrency,
    handleInputAmountChange,
    handleQuickAmountSelect,
    handleCustomRateChange,
    handleInputCurrencySelect,
    inputOptions,
    quickAmounts,
    customRateInput,
    inputSelectedOptionId,
  } = useExchangeInput({ selectedBaseRate, baseRateOptions });

  return (
    <SwapAmountBlock
      amount={getDisplayAmount(inputAmount)}
      code={inputCurrency.code}
      editable
      icon={inputCurrency.icon}
      onAmountChange={handleInputAmountChange}
      onCustomRateChange={handleCustomRateChange}
      onCurrencySelect={handleInputCurrencySelect}
      onQuickAmountSelect={handleQuickAmountSelect}
      options={inputOptions}
      quickAmounts={quickAmounts}
      customRate={customRateInput}
      showCustomRateInput={inputSelectedOptionId === "custom"}
      selectedOptionId={inputSelectedOptionId}
      symbol={inputCurrency.symbol}
    />
  );
}
