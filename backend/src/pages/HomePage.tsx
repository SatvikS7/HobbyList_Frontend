import { Link } from "react-router-dom";

const HomePage = () => {
  return (
  <div className="h-screen flex flex-col justify-center items-center gap-8 bg-white">
    <div className="flex gap-6">
      <Link to="/upload-photo">
        <button className="px-8 py-4 text-lg font-medium rounded-lg bg-gradient-to-r from-[#fadd9e] to-[#fadd9e] text-[#c77903] shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200">
          Upload Photo
        </button>
      </Link>
    </div>
  </div>
);

};

export default HomePage;
