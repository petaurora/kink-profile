import { AppIcon } from "./AppIcon";
import { appIcons } from "./appIcons";
import { useRef } from "react";
import "./search.css";

export type SearchFieldProps =
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
  return <appIcons.search className="kp-search-field__icon" size={24} stroke={1.65} aria-hidden="true" />;
}

/**
 * Shared launcher and editable search surface. Matching and result policy
 * belong to the caller.
 * The launcher is a button; editable locations render the same surface
 * with a search input and optional clear action.
 */
export function SearchField(props: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (props.mode === "launch") {
    return (
      <button
        type="button"
        className="kp-ui kp-search-field kp-search-field--launch"
        aria-label={props.ariaLabel || props.placeholder}
        aria-haspopup="dialog"
        onClick={props.onActivate}
      >
        <SearchIcon />
        <span className="kp-search-field__placeholder">
          {props.placeholder}
        </span>
      </button>
    );
  }

  return (
    <div className="kp-ui kp-search-field kp-search-field--input">
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
          className="kp-search-field__clear"
          aria-label="Clear search"
          title="Clear search"
          onClick={() => {
            props.onClear();
            inputRef.current?.focus();
          }}
        >
          <AppIcon name="close" size={18} />
        </button>
      )}
    </div>
  );
}
