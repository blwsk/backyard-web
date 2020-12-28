import { ReactElement, MouseEventHandler, ReactNode } from "react";
import { classNames } from "../../lib/classNames";

type Variant = "primary" | "secondary" | "selectable";

type Size = "normal" | "small";

const Button = ({
  children,
  current = false,
  disabled = false,
  first,
  grouped = false,
  last,
  onClick,
  size = "normal",
  variant = "primary",
}: {
  children: ReactNode;
  current?: boolean;
  disabled?: boolean;
  first?: boolean;
  grouped?: boolean;
  last?: boolean;
  onClick?: MouseEventHandler;
  size?: Size;
  variant?: Variant;
}): ReactElement => {
  return (
    <button
      className={classNames(`m-0`, {
        rounded: !grouped,

        /**
         * Sizes
         */
        "py-2 px-3 text-base": size === "normal",
        "py-1 px-2 text-sm": size === "small",

        /**
         * Variants
         */
        "text-white bg-gray-900 hover:bg-black": variant === "primary",
        "text-black bg-gray-300 hover:bg-gray-400":
          variant === "secondary" || variant === "selectable",

        /**
         * Selectable
         */
        "bg-gray-400": variant === "selectable" && current,

        /**
         * Button groups
         */
        "rounded-l-md": grouped && first,
        "rounded-r-md": grouped && last,
      })}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
