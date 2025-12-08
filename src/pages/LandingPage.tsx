import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center gap-8 bg-white">
      <h1 className="text-4xl font-extrabold text-[#c77903] mb-4">Welcome to HobbyList</h1>

      <div className="flex gap-6">
        <Link to="/login">
          <button className="px-8 py-4 text-lg font-semibold rounded-lg bg-gradient-to-r from-[#fadd9e] to-[#fadd9e] text-[#c77903] shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-200">
            Login
          </button>
        </Link>

        <Link to="/signup">
          <button className="px-8 py-4 text-lg font-semibold rounded-lg bg-[#c77903] text-white shadow-md hover:bg-[#b36b02] hover:scale-105 hover:shadow-lg transition-transform duration-200">
            Sign Up
          </button>
        </Link>

        <Link to="/password-reset">
          <button className="px-8 py-4 text-lg font-semibold rounded-lg border-2 border-[#b99547] text-[#b99547] hover:bg-[#b99547] hover:text-white hover:scale-105 transition-all duration-200">
            Reset Password
          </button>
        </Link>
      </div>
    </div>
  );

};

export default LandingPage;
