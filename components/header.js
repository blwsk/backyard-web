import Link from "next/link";
import { useAuth } from "../lib/useAuth";

const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header
      style={{
        padding: 16,
        display: "flex",
        alignItems: "center",
      }}
    >
      {isAuthenticated && (
        <>
          <div
            style={{
              borderRadius: "50%",
              padding: "10px",
              fontSize: "30px",
              height: "52px",
              width: "52px",
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
              marginRight: 16,
              paddingBottom: 12,
            }}
          >
            🏕
          </div>
          <div style={{ marginRight: 16 }}>
            <Link href="/">
              <a
                style={{
                  fontWeight: 500,
                }}
                className="color-black"
              >
                Home
              </a>
            </Link>
          </div>
          <div style={{ marginRight: 16 }}>
            <Link href="/my-content">
              <a
                style={{
                  fontWeight: 500,
                }}
                className="color-black"
              >
                My Content
              </a>
            </Link>
          </div>
          <div style={{ marginRight: 16 }}>
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
          </div>
          <div style={{ marginRight: 16 }}>
            <Link href="/selections">
              <a
                style={{
                  fontWeight: 500,
                }}
                className="color-black"
              >
                Selections
              </a>
            </Link>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
