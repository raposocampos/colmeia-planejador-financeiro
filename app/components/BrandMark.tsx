import Image from "next/image";

interface BrandMarkProps {
  compact?: boolean;
  inverse?: boolean;
}

export function BrandMark({ compact = false, inverse = false }: BrandMarkProps) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <div
      className={"brand-lockup" + (inverse ? " brand-lockup--inverse" : "")}
      aria-label="Colmeia Educação Financeira"
    >
      <Image
        className="brand-emblem"
        src={basePath + "/brand/colmeia-symbol.png"}
        alt=""
        width={48}
        height={48}
        aria-hidden="true"
        unoptimized
      />
      {!compact && (
        <span className="brand-words">
          <strong>COLMEIA</strong>
          <small>EDUCAÇÃO FINANCEIRA</small>
        </span>
      )}
    </div>
  );
}
