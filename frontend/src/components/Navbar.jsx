import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import "../styles/navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const logoutUser = () => {
    Cookies.remove("jwt_token");
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">

      <Link to="/" className="logo-link">
        <h1 className="logo">AI Travel Planner</h1>
      </Link>

      <div className="nav-links">

        <Link to="/" className="nav-link">
          Home
        </Link>

        <button
          type="button"
          className="logout-btn"
          onClick={logoutUser}
        >
          Logout
        </button>

      </div>

    </nav>
  );
};

export default Navbar;