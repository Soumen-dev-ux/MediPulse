import {
  Activity,
  LogOut,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import useAuth from "../Context/useAuth";

import { logoutUser } from "../firebase/auth";


export default function Navbar() {

  const {
    user,
    userData,
  } = useAuth();

  const navigate = useNavigate();


  const handleLogout = async () => {

    await logoutUser();

    navigate("/login");

  };


  return (
    <nav className="navbar">

      <Link
        to="/"
        className="logo"
      >
        <Activity size={26} />
        MediPulse
      </Link>


      <div className="nav-links">

        <Link to="/about">
          About
        </Link>

        {user && (
          <span className="nav-role">
            {userData?.role || "Patient"}
          </span>
        )}


        {!user ? (

          <>
            <Link to="/login">
              Login
            </Link>

            <Link
              to="/register"
              className="nav-button"
            >
              Get Started
            </Link>
          </>

        ) : (

          <button
            className="nav-logout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>

        )}

      </div>

    </nav>
  );
}