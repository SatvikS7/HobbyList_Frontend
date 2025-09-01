import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "2rem",
      }}
    >
      <div style={{ display: "flex", gap: "1.5rem" }}>
        <Link to="/login">
          <button
            style={{
              padding: "1rem 2rem",
              fontSize: "1.1rem",
              borderRadius: "8px",
              border: "none",
              color: "red",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button
            style={{
              padding: "1rem 2rem",
              fontSize: "1.1rem",
              borderRadius: "8px",
              border: "none",
              color: "green",
              cursor: "pointer",
            }}
          >
            Sign Up
          </button>
        </Link>
        <Link to="/password-reset">
          <button
            style={{
              padding: "1rem 2rem",
              fontSize: "1.1rem",
              borderRadius: "8px",
              border: "none",
              color: "green",
              cursor: "pointer",
            }}
          >
            Reset Password
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
