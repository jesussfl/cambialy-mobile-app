import { useEffect, useRef, useState } from "react";

import { useSettingsStore } from "@/features/settings/context/settings-context";

import { placeholderFor, toDisplay, toExpressionPreview, toNumber } from "../model/amount-draft";
import { keypadReducer } from "../model/keypad-reducer";
import type { AmountDraft, KeypadAction, KeypadConfig, MathOperator, PrecisionPolicy } from "../model/types";

type FieldSpec = { readonly precision: PrecisionPolicy };

type UseKeypadFieldsParams<F extends string> = {
  /** Every keypad-backed field on the screen, with the precision its evaluated results keep. */
  fields: Record<F, FieldSpec>;
  /** Current drafts. Owned by the caller — Zustand on the exchange screen, `useState` on comparison. */
  drafts: Record<F, AmountDraft>;
  setDraft: (field: F, next: AmountDraft) => void;
  initialField: F;
};

/**
 * Binds the pure keypad reducer to a screen's fields and the user's entry settings.
 *
 * Each field carries its own draft, so input, deletion, and clearing in one cannot disturb another —
 * the defect that the previous shared `hasTyped` flag produced. The hook stays controlled (drafts in,
 * changes out) so the two screens can keep the state owner each needs without agreeing on one.
 */
export function useKeypadFields<F extends string>({ fields, drafts, setDraft, initialField }: UseKeypadFieldsParams<F>) {
  const mode = useSettingsStore((s) => s.amountInputMode);
  const decimalSeparator = useSettingsStore((s) => s.decimalSeparator);

  const [activeField, setActiveField] = useState<F>(initialField);

  const fieldIds = Object.keys(fields) as F[];
  const configFor = (field: F): KeypadConfig => ({ mode, decimalSeparator, precision: fields[field].precision });

  // Re-encode every buffer when the entry mode changes, so a value entered as cents keeps its meaning
  // once it is read as a plain number (and back). Reinterpreting the old buffer under the new grammar
  // would silently rescale it by 100.
  const previousModeRef = useRef(mode);
  useEffect(() => {
    const previousMode = previousModeRef.current;
    if (previousMode === mode) return;
    previousModeRef.current = mode;

    fieldIds.forEach((field) => {
      const previousConfig: KeypadConfig = { mode: previousMode, decimalSeparator, precision: fields[field].precision };
      setDraft(field, keypadReducer(drafts[field], { type: "setMode", mode }, previousConfig));
    });
  }, [mode, decimalSeparator, drafts, fields, fieldIds, setDraft]);

  const dispatch = (action: KeypadAction) => {
    setDraft(activeField, keypadReducer(drafts[activeField], action, configFor(activeField)));
  };

  const display = {} as Record<F, string>;
  const values = {} as Record<F, number>;

  fieldIds.forEach((field) => {
    const config = configFor(field);
    display[field] = toDisplay(drafts[field], config);
    values[field] = toNumber(drafts[field], config) ?? 0;
  });

  return {
    activeField,
    setActiveField,
    /** Formatted value per field. Empty string means the field is empty — render the placeholder. */
    display,
    /** Numeric value per field, used directly by conversion and comparison. Never re-parsed from text. */
    values,
    expressionPreview: toExpressionPreview(drafts[activeField], configFor(activeField)),
    placeholder: placeholderFor(decimalSeparator),
    mode,
    decimalSeparator,
    handlers: {
      onKeyPress: (value: string) => {
        if (value === "," || value === ".") {
          dispatch({ type: "decimal" });
          return;
        }
        dispatch({ type: "digit", digit: value });
      },
      onDelete: () => dispatch({ type: "delete" }),
      onClear: () => dispatch({ type: "clear" }),
      onOperatorPress: (operator: MathOperator) => dispatch({ type: "operator", operator }),
      onEvaluate: () => dispatch({ type: "evaluate" }),
    },
  };
}
