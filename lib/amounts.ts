export type ExactDecimal = { coefficient: bigint; scale: number; };

export type ParsedAmount =
  | { status: "empty" | "partial" | "invalid"; }
  | { status: "valid"; baseUnits: bigint; };

type LocaleRules = {
  digits: ReadonlyMap<string, string>;
  decimal: string;
  group?: string;
  primaryGroupWidth: number;
  secondaryGroupWidth: number;
};

const getLocaleRules = (locale: string): LocaleRules => {
  const formatter = new Intl.NumberFormat(locale);
  const parts = formatter.formatToParts(123_456_789.1);
  const digits = new Map<string, string>();

  for (let digit = 0; digit <= 9; digit += 1) {
    const ascii = String(digit);
    const localized = new Intl.NumberFormat(locale, { useGrouping: false }).format(digit);

    digits.set(ascii, ascii);
    digits.set(localized, ascii);
  }

  const widths = formatter.formatToParts(123_456_789_012_345_678_901n)
    .filter(part => part.type === "integer")
    .map(part => Array.from(part.value).length);

  return {
    digits,
    decimal: parts.find(part => part.type === "decimal")?.value ?? ".",
    group: parts.find(part => part.type === "group")?.value,
    primaryGroupWidth: widths.at(-1) ?? 3,
    secondaryGroupWidth: widths.at(-2) ?? widths.at(-1) ?? 3,
  };
};

const hasValidGrouping = (value: string, primary: number, secondary: number) => {
  if (!value.includes("_")) return /^\d*$/u.test(value);

  const groups = value.split("_");
  const first = groups[0] ?? "";
  const middle = groups.slice(1, -1);
  const last = groups.at(-1) ?? "";

  return /^\d+$/u.test(first)
    && first.length <= secondary
    && middle.every(group => /^\d+$/u.test(group) && group.length === secondary)
    && /^\d+$/u.test(last)
    && last.length === primary;
};

export const parseLocalizedDecimal = (input: string, locale: string): ExactDecimal | undefined => {
  const rules = getLocaleRules(locale);
  let normalized = "";

  for (const character of input) {
    const digit = rules.digits.get(character);

    if (digit !== undefined) normalized += digit;
    else if (character === rules.decimal) normalized += ".";
    else if (rules.group !== undefined && character === rules.group) normalized += "_";
    else return;
  }

  const parts = normalized.split(".");

  if (parts.length > 2) return;

  const integer = parts[0] ?? "";
  const fraction = parts[1] ?? "";

  if (!hasValidGrouping(integer, rules.primaryGroupWidth, rules.secondaryGroupWidth)) return;

  if (!/^\d*$/u.test(fraction)) return;

  if (`${integer}${fraction}` === "" || normalized.endsWith(".")) return;

  return {
    coefficient: BigInt(`${integer.replaceAll("_", "")}${fraction}`),
    scale: fraction.length,
  };
};

export const toBaseUnits = (amount: ExactDecimal, decimals: number) => {
  if (!Number.isInteger(decimals) || decimals < amount.scale || decimals > 255) return;

  return amount.coefficient * (10n ** BigInt(decimals - amount.scale));
};

const isPartialLocalizedDecimal = (input: string, locale: string) => {
  const rules = getLocaleRules(locale);

  if (input === rules.decimal) return true;

  if (input.endsWith(rules.decimal)) {
    return parseLocalizedDecimal(input.slice(0, -rules.decimal.length), locale) !== undefined;
  }

  if (rules.group === undefined || !input.includes(rules.group)) return false;

  return Array.from(
    { length: rules.primaryGroupWidth },
    (_, index) => `${input}${"0".repeat(index + 1)}`,
  ).some(candidate => parseLocalizedDecimal(candidate, locale) !== undefined);
};

export const parseLocalizedAmount = (value: string, locale: string, decimals: number): ParsedAmount => {
  if (value === "") return { status: "empty" };

  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) return { status: "invalid" };

  const amount = parseLocalizedDecimal(value, locale);

  if (amount === undefined) {
    return { status: isPartialLocalizedDecimal(value, locale) ? "partial" : "invalid" };
  }

  const baseUnits = toBaseUnits(amount, decimals);

  return baseUnits === undefined
    ? { status: "invalid" }
    : { status: "valid", baseUnits };
};

const isUnsignedScientificNotation = (value: string): value is Intl.StringNumericLiteral => (
  /^\d+E-\d+$/u.test(value)
);

export const formatBaseUnits = (baseUnits: bigint, locale: string, decimals: number) => {
  if (baseUnits < 0n || !Number.isInteger(decimals) || decimals < 0 || decimals > 100) return;

  const exactValue = `${baseUnits}E-${decimals}`;

  if (!isUnsignedScientificNotation(exactValue)) return;

  return new Intl.NumberFormat(locale, { maximumFractionDigits: decimals })
    .format(exactValue);
};
