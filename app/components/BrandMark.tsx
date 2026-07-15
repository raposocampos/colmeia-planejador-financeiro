interface BrandMarkProps {
  compact?: boolean;
  inverse?: boolean;
}

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  return (
    <div
      className={"brand-lockup" + (inverse ? " brand-lockup--inverse" : "")}
      aria-label="Colmeia Educação Financeira"
    >
      <span className="brand-cells" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
      {!compact && (
        <span className="brand-words">
          <strong>COLMEIA</strong>
          <small>EDUCAÇÃO FINANCEIRA</small>
        </span>
      )}
    </div>
  );
}
