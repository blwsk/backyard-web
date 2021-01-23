import {
  ReactElement,
  MouseEventHandler,
  ReactNode,
  forwardRef,
  Ref,
} from "react";
import { classNames } from "../../lib/classNames";

type Variant = "primary" | "secondary" | "selectable";

type Size = "normal" | "small";

const Button = forwardRef(
  (
    {
      children,
      current = false,
      disabled = false,
      first,
      grouped = false,
      last,
      onClick,
      size = "normal",
      variant = "primary",
      className = "",
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
      className?: string;
    },
    ref: Ref<any>
  ): ReactElement => {
    return (
      <button
        ref={ref}
        className={classNames(`m-0`, className, {
          rounded: !grouped,

          /**
           * Sizes
           */
          "py-2 px-3 text-base": size === "normal",
          "py-1 px-2 text-sm": size === "small",

          /**
           * Variants
           */
          "text-white bg-gray-800 hover:bg-gray-900 dark:text-black dark:bg-gray-400 dark-hover:bg-gray-300":
            variant === "primary",
          "text-black bg-gray-300 hover:bg-gray-400 dark:text-white dark:bg-gray-800 dark-hover:bg-gray-900":
            variant === "secondary" || variant === "selectable",

          /**
           * Selectable
           */
          "bg-gray-400 dark:bg-gray-900 underline":
            variant === "selectable" && current,

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
  }
);

export default Button;
