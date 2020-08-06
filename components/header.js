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
              background: "#12b886",
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
          <div>
            <a
              href="/my-content"
              style={{
                fontWeight: 500,
              }}
              className="color-black"
            >
              My Content
            </a>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
