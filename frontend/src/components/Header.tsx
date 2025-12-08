import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem("jwt");
    navigate("/");
  }

  return (
    <header className="w-full bg-gradient-to-r from-[#fadd9e] to-[#b99547] px-6 py-4 shadow-md fixed top-0 left-0 z-50 flex flex-row justify-between items-center box-border">
      <Link
        to={isLoggedIn ? '/home-page' : '/'}
        className="no-underline"
      >
        <h1 className="text-lg font-extrabold text-[#c77903] m-0">HobbyList</h1>
      </Link>

      {isLoggedIn && (
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/discovery-page')} 
            className="hover:text-[#5a4510] font-semibold no-underline transition-colors"
          >
            Discovery
          </button>
          
          <button 
            onClick={() => navigate('/profile-page')} 
            className="hover:text-[#5a4510] font-semibold no-underline transition-colors"
          >
            Profile
          </button>
          
          <button 
            onClick={handleLogout} 
            className="hover:text-[#5a4510] font-semibold no-underline transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );

};

export default Header;
