import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LogoutButton from "./LogoutButton";
import ProfileButton from "./ProfileButton";

const Header = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="header">
      <Link to={isLoggedIn ? "/home-page" : "/"} style={{ textDecoration: "none" }}>
        <h1>HobbyList</h1>
      </Link>
      {isLoggedIn ? (
        <div className="header-buttons">
          <ProfileButton />
          <LogoutButton />
        </div>
      ) : null}
    </div>
  );
};

export default Header;
