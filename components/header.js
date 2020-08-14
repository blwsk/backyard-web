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
            className="background-blue"
            style={{
              borderRadius: "50%",
              padding: "10px",
              fontSize: "20px",
              height: "52px",
              width: "52px",
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
              color: "rgba(255,255,255,0.6)",
              marginRight: 16,
            }}
          ></div>
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
          <div>
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
        </>
      )}
    </header>
  );
};

export default Header;
