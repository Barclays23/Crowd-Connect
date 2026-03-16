/** Toggle pill button used for filters */
export function PillToggle<T extends string>({
  options,
  value,
  onChange,
  className = "",
  buttonClassName = "",
  selectedClassName = "bg-(--brand-primary) text-(--btn-primary-text) border-(--brand-primary) shadow-sm",
  unselectedClassName = "bg-(--form-input-bg) text-(--form-input-text) border-(--form-border) hover:border-(--brand-primary)",
}: {
  options: { value: T; label: string }[];
  value: T | "";
  onChange: (value: T) => void;
  className?: string;
  buttonClassName?: string;
  selectedClassName?: string;
  unselectedClassName?: string;
}) {
  return (
    <div className={`flex gap-1.5 flex-wrap ${className}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${buttonClassName} ${
            value === o.value ? selectedClassName : unselectedClassName
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}