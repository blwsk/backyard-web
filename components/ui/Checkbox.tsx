import { ReactElement, ChangeEvent } from "react";

const Checkbox = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}): ReactElement => {
  return (
    <input
      type="checkbox"
      className="form-checkbox cursor-pointer"
      onChange={onChange}
      checked={checked}
      disabled={disabled}
    />
  );
};

export default Checkbox;
