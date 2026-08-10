import Toggle from "./Toggle";

export default function ToggleRow({
  label,
  defaultOn = false,
  last = false,
}: {
  label: string;
  defaultOn?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center py-[13px] text-sm ${
        last ? "" : "border-b border-border"
      }`}
    >
      <span className="text-text">{label}</span>
      <Toggle defaultOn={defaultOn} />
    </div>
  );
}
