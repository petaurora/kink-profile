import "./SegmentedControl.css";

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: readonly SegmentedControlOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className="segmented-control" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={active ? "segmented-control-option is-active" : "segmented-control-option"}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
