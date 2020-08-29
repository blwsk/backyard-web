import Link from "next/link";

const Header = () => {
  return (
    <header
      style={{
        padding: 16,
        display: "flex",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontSize: "30px",
          marginRight: 24,
        }}
      >
        <Link href="/">
          <a>🏕</a>
        </Link>
      </span>
      <span style={{ marginRight: 20 }}>
        <Link href="/my-content">
          <a
            style={{
              fontWeight: 500,
            }}
            className="color-black"
          >
            Saved
          </a>
        </Link>
      </span>
      <span style={{ marginRight: 20 }}>
        <Link href="/lists">
          <a
            style={{
              fontWeight: 500,
            }}
            className="color-black"
          >
            Lists
          </a>
        </Link>
      </span>
      <span style={{ marginRight: 20 }}>
        <Link href="/clips">
          <a
            style={{
              fontWeight: 500,
            }}
            className="color-black"
          >
            Clips
          </a>
        </Link>
      </span>
    </header>
  );
};

export default Header;
