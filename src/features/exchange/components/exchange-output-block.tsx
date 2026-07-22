import { useExchangeContext } from "../context/exchange-context";
import { useExchangeRatesList } from "../hooks/use-exchange-rates-list";
import { useExchangeConversion } from "../hooks/use-exchange-conversion";
import { useExchangeInput } from "../hooks/use-exchange-input";
import { SwapAmountBlock } from "./swap-amount-block";

export function ExchangeOutputBlock() {
  const { selectedBaseRateId, customRateValue, selectedTargetCurrencyId, inputAmount, isReversed } =
    useExchangeContext((state) => state);

  const { rates, selectedBaseRate } = useExchangeRatesList(selectedBaseRateId, customRateValue);

  const baseRateOptions = rates.map((rate) => rate.info);

  const {
    outputCurrency,
    handleCustomRateChange,
    handleOutputCurrencySelect,
    outputOptions,
    outputSelectedOptionId,
    customRateInput,
  } = useExchangeInput({ selectedBaseRate, baseRateOptions });

  const { outputAmountText, outputCopyText } = useExchangeConversion({
    inputAmount,
    isReversed,
    rates,
    selectedBaseRate,
    selectedTargetCurrencyId,
    customRateValue,
  });

  return (
    <SwapAmountBlock
      amount={outputAmountText}
      code={outputCurrency.code}
      icon={outputCurrency.icon}
      label="Cambio estimado"
      copyText={outputCopyText}
      onCustomRateChange={handleCustomRateChange}
      onCurrencySelect={handleOutputCurrencySelect}
      options={outputOptions}
      selectedOptionId={outputSelectedOptionId}
      customRate={customRateInput}
      showCustomRateInput={outputSelectedOptionId === "custom"}
      symbol={outputCurrency.symbol}
    />
  );
}
