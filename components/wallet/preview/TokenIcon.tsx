type TokenIconProps = {
  symbol?: string;
  name?: string;
};

export function TokenIcon({ symbol, name }: TokenIconProps) {
  const letter = (symbol ?? name ?? "T").slice(0, 1).toUpperCase();

  return (
    <span className="wallet-preview-token-icon" aria-hidden>
      {letter}
    </span>
  );
}
