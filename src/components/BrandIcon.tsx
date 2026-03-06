import React from "react";

type Props = {
  className?: string;
  alt?: string;
  size?: number;
};

export default function BrandIcon({
  className = "",
  alt = "AgroConecta",
  size,
}: Props) {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <div
      className={`brand-icon ${className}`}
      style={style}
      aria-hidden={false}
      title={alt}
    >
      <img src="/brand-icon.png" alt={alt} className="brand-icon-image" />
    </div>
  );
}
