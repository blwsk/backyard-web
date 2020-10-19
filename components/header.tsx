import Link from "next/link";
import AuthInteraction from "./authInteraction";

const GenericHeader = () => {
  return (
    <div>
      <header>
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
        <span style={{ marginRight: 20 }}>
          <AuthInteraction />
        </span>
      </header>
      <style jsx>{`
        header {
          padding: 16px;
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

const Header = () => {
  return <GenericHeader />;
};

export default Header;
