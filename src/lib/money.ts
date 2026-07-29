export function parseAmountToMinorUnits(value: string) {
  const cleaned = value.trim().replace(/,/g, "");

  if (!cleaned) {
    throw new Error("Amount is required.");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error("Amount must be a valid number with up to 2 decimals.");
  }

  const [wholePart, decimalPart = ""] = cleaned.split(".");
  const cents = decimalPart.padEnd(2, "0");

  const amountMinor = BigInt(wholePart) * 100n + BigInt(cents);

  if (amountMinor <= 0n) {
    throw new Error("Amount must be greater than 0.");
  }

  return amountMinor;
}

export function formatMoneyFromMinorUnits(
  amountMinor: bigint,
  currency = "USD"
) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
  }).format(Number(amountMinor) / 100);
}

export function formatMinorUnitsForInput(amountMinor: bigint) {
  const isNegative = amountMinor < 0n;
  const value = isNegative ? -amountMinor : amountMinor;

  const whole = value / 100n;
  const cents = value % 100n;

  return `${isNegative ? "-" : ""}${whole.toString()}.${cents
    .toString()
    .padStart(2, "0")}`;
}