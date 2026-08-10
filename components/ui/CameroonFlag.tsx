export default function CameroonFlag({
  width = 28,
  height = 20,
  className = "",
  style,
}: {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 3 2"
      className={className}
      style={{ borderRadius: 3, display: "block", flexShrink: 0, ...style }}
    >
      <rect width="1" height="2" fill="#007A5E" />
      <rect x="1" width="1" height="2" fill="#CE1126" />
      <rect x="2" width="1" height="2" fill="#FCD116" />
      <polygon
        points="1.5,0.55 1.59,0.82 1.87,0.82 1.64,0.98 1.73,1.25 1.5,1.09 1.27,1.25 1.36,0.98 1.13,0.82 1.41,0.82"
        fill="#FCD116"
      />
    </svg>
  );
}
