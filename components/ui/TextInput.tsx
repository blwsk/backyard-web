import { ReactElement, ChangeEvent, FocusEvent, KeyboardEvent } from "react";
import { classNames } from "../../lib/classNames";

const TextInput = ({
  autoFocus,
  className,
  disabled,
  onBlur,
  onChange,
  onFocus,
  onKeyDown,
  placeholder,
  readOnly,
  value,
}: {
  autoFocus?: boolean;
  className?: string;
  disabled?: boolean;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  value: string;
}): ReactElement => {
  return (
    <input
      type="text"
      className={classNames("form-input bg-gray-100", className)}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      autoFocus={autoFocus}
      disabled={disabled}
      readOnly={readOnly}
    />
  );
};

export default TextInput;
