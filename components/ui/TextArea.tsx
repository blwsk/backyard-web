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
  onBlur?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: FocusEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  value: string;
}): ReactElement => {
  return (
    <textarea
      className={classNames(
        "form-textarea bg-gray-100 dark:bg-gray-900 dark:border-gray-900",
        className
      )}
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
