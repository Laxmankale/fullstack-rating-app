import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Brand */}
        <Link to="/" className="text-xl font-bold hover:text-gray-300">
          MyApp
        </Link>

        {/* Menu Links */}
        <div className="space-x-4">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link to="/login" className="hover:text-gray-300">
            Login
          </Link>
          <Link to="/signup" className="hover:text-gray-300">
            Signup
          </Link>
        </div>
      </div>
    </nav>
  );
}
