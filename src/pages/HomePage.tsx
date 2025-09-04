import { Link } from "react-router-dom";

const HomePage = () => {
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
        <Link to="/upload-photo">
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
            Upload Photo
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
