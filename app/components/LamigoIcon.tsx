const PETAL = "M 0,0 L 4.5,-106.92 Q 7,-108 -1,-107.46 C -34,-88 -40,-42 -1.5,-1.5 Z";
const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;

interface LamigoIconProps {
  size?: number | string;
  color?: string;
  background?: string;
  backgroundRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
}

export default function LamigoIcon({
  size,
  color = "currentColor",
  background,
  backgroundRadius,
  className,
  style,
  label,
}: LamigoIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 460 460"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-label={label}
      role={label ? "img" : "presentation"}
    >
      {background && background !== "none" && (
        <rect width="460" height="460" fill={background} rx={backgroundRadius} ry={backgroundRadius} />
      )}
      <g transform="translate(230,230)">
        {ANGLES.map(angle => (
          <g key={angle} transform={`rotate(${angle})`}>
            <path d={PETAL} fill={color} />
          </g>
        ))}
      </g>
    </svg>
  );
}
