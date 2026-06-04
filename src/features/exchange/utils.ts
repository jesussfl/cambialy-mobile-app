export const parseCurrencyAmount = (value: string) => {
  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.includes(",") && trimmedValue.includes(".") ? trimmedValue.replace(/,/g, "") : trimmedValue.replace(",", ".");

  return Number(normalizedValue);
};

export const formatNumber = (value: number, digits = 2) =>
  new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);

export const formatCompactAmount = (value: number) => {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatRate = (value: number) => (value > 0 ? `${formatNumber(value)} Bs.` : "Sin datos");

export const formatUpdatedAt = (value?: string) => {
  if (!value) {
    return "Actualizacion pendiente";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Actualizacion pendiente";
  }

  return `Actualizado ${new Intl.DateTimeFormat("es-VE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
};

export const getDisplayAmount = (amount: string) => {
  if (!amount) {
    return "";
  }

  return amount.replace(".", ",");
};

export const sanitizeAmountInput = (value: string) => {
  const normalizedValue = value.replace(",", ".").replace(/[^\d.]/g, "");
  const [wholePart = "", ...decimalParts] = normalizedValue.split(".");
  const decimals = decimalParts.join("").slice(0, 2);
  const trimmedWholePart = wholePart.replace(/^0+(?=\d)/, "").slice(0, 9);

  if (normalizedValue.includes(".")) {
    return `${trimmedWholePart || "0"}.${decimals}`;
  }

  return trimmedWholePart;
};
