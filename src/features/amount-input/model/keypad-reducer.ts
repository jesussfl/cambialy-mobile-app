import { draftFromValue, evaluateBuffer, toNumber } from "./amount-draft";
import { appendOperatorToExpression } from "./arithmetic";
import {
  createBuffer,
  EMPTY_DRAFT,
  hasOperator,
  isOperatorChar,
  roundToPrecision,
  trailingSegment,
  type AmountDraft,
  type KeypadAction,
  type KeypadConfig,
} from "./types";

/**
 * The whole keypad, as one pure function.
 *
 * The buffer is the only mutable state and the only thing any action writes. Nothing here reads a
 * formatted or canonical string back in, which is what makes the projections in `amount-draft.ts`
 * one-way and the whole machine terminating.
 */
export function keypadReducer(draft: AmountDraft, action: KeypadAction, config: KeypadConfig): AmountDraft {
  switch (action.type) {
    case "digit": {
      // A sealed buffer holds a finished value, so the next digit starts a new number rather than
      // extending the old one — standard calculator behaviour, and the last place a completed value
      // could otherwise be re-read as a partial one.
      const base = draft.sealed ? "" : draft.buffer;
      return { buffer: createBuffer(`${base}${action.digit}`), sealed: false };
    }

    case "decimal": {
      // Cents entry has a fixed decimal position, so the key has nothing to do there.
      if (config.mode !== "manual") return draft;

      const base = draft.sealed ? "" : draft.buffer;
      if (trailingSegment(base).includes(".")) return draft;

      const needsLeadingZero = base === "" || isOperatorChar(base[base.length - 1]);
      return { buffer: createBuffer(needsLeadingZero ? `${base}0.` : `${base}.`), sealed: false };
    }

    case "operator": {
      // An expression cannot begin with an operator.
      if (!draft.buffer) return draft;
      return { buffer: createBuffer(appendOperatorToExpression(draft.buffer, action.operator)), sealed: false };
    }

    case "delete": {
      // Exactly one character, off the raw buffer. Because nothing re-interprets the remainder, n
      // deletes on an n-character buffer reach empty and no value is a fixed point.
      return { buffer: createBuffer(draft.buffer.slice(0, -1)), sealed: false };
    }

    case "clear":
      return EMPTY_DRAFT;

    case "evaluate": {
      if (!hasOperator(draft.buffer)) return draft;

      const value = evaluateBuffer(draft.buffer, config.mode);
      // Division by zero and other unevaluable states leave the last valid value in place rather than
      // rendering Infinity, NaN, or an empty field.
      if (value === null) return draft;

      return draftFromValue(roundToPrecision(value, config.precision), config);
    }

    case "setValue":
      return draftFromValue(action.value, config);

    case "setMode": {
      // Re-encode through the value so the buffer means the same number in the new mode, instead of
      // being reinterpreted under a grammar it was not written in.
      const value = toNumber(draft, config);
      if (value === null) return draft;
      return draftFromValue(value, { ...config, mode: action.mode });
    }
  }
}
