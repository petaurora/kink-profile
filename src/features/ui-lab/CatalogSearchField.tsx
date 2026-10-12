import { useRef } from "react";

type CatalogSearchFieldProps =
  | {
      mode: "launch";
      placeholder: string;
      onActivate: () => void;
      ariaLabel?: string;
    }
  | {
      mode: "input";
      placeholder: string;
      value: string;
      onChange: (value: string) => void;
      onClear: () => void;
      inputId?: string;
      ariaLabel?: string;
      resultsId?: string;
      autoFocus?: boolean;
    };

function SearchIcon() {
  return (
    <svg
      className="lab-search-field__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

/**
 * Shared search-field surface for the UI Lab's landing-page launcher,
 * Catalog collection lists, and global search dialog.
 * The launcher is a button; editable locations render the same surface
 * with a search input and optional clear action.
 */
export function CatalogSearchField(props: CatalogSearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (props.mode === "launch") {
    return (
      <button
        type="button"
        className="lab-search-field lab-search-field--launch"
        aria-label={props.ariaLabel || props.placeholder}
        onClick={props.onActivate}
      >
        <SearchIcon />
        <span className="lab-search-field__placeholder">{props.placeholder}</span>
      </button>
    );
  }

  return (
    <div className="lab-search-field lab-search-field--input">
      <SearchIcon />
      <input
        ref={inputRef}
        id={props.inputId}
        type="search"
        autoComplete="off"
        autoFocus={props.autoFocus}
        aria-label={props.ariaLabel || props.placeholder}
        aria-controls={props.resultsId}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      />
      {props.value && (
        <button
          type="button"
          className="lab-search-field__clear"
          aria-label="Clear search"
          onClick={() => {
            props.onClear();
            inputRef.current?.focus();
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6 18 18M18 6 6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}
