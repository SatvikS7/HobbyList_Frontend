import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LogoutButton from "./LogoutButton";
import ProfileButton from "./ProfileButton";

const Header = () => {
  const { isLoggedIn } = useAuth();

  return (
    <header className="w-full bg-gradient-to-r from-[#fadd9e] to-[#b99547] px-6 py-4 shadow-md fixed top-0 left-0 z-50 flex flex-row justify-between items-center box-border">
      <Link
        to={isLoggedIn ? '/home-page' : '/'}
        className="no-underline"
      >
        <h1 className="text-lg font-extrabold text-[#c77903] m-0">HobbyList</h1>
      </Link>

      {isLoggedIn && (
        <div className="flex items-center gap-3">
          <ProfileButton />
          <LogoutButton />
        </div>
      )}
    </header>
  );

};

export default Header;
