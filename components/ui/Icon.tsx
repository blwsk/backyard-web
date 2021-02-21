type IconName = "copy" | "trash" | "external-link" | "loader" | "mail";

type IconSize = "sm" | "md" | "lg" | "xl";

const dimensions = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 36,
};

/**
 * See https://github.com/feathericons/feather#svg-sprite
 */
const Icon = ({ name, size = "md" }: { name: IconName; size: IconSize }) => {
  const dim = dimensions[size];
  return (
    <svg
      width={dim}
      height={dim}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <use xlinkHref={`/feather-sprite.svg#${name}`} />
    </svg>
  );
};

export default Icon;
