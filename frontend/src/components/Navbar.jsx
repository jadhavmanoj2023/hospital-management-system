import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { toast } from "react-toastify";
import { Context } from "../main";
import api from "../utils/axios";

const Navbar = () => {
  // false = menu visible (navLinks), true = menu hidden (showmenu with left: -100%)
  const [show, setShow] = useState(true);
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    setShow(true); // close mobile menu
    try {
      const { data } = await api.get("/user/patient/logout");
      toast.success(data.message);
      setIsAuthenticated(false);
      navigateTo("/login");
    } catch (error) {
      // Still log out locally so user is not stuck (e.g. cookie not sent cross-origin)
      setIsAuthenticated(false);
      navigateTo("/login");
      toast.error(
        error?.response?.data?.message || "Logout failed"
      );
    }
  };

  const goToLogin = () => {
    setShow(true); // close mobile menu
    navigateTo("/login");
  };

  return (
    <nav className="container">
      <div className="logo">
        <img src="/logo.png" alt="logo" className="logo-img" />
      </div>

      <div className={show ? "navLinks showmenu" : "navLinks"}>
        <div className="links">
          <Link to="/" onClick={() => setShow(true)}>Home</Link>
          <Link to="/appointment" onClick={() => setShow(true)}>Appointment</Link>
          <Link to="/about" onClick={() => setShow(true)}>About Us</Link>
        </div>

        {isAuthenticated ? (
          <button className="logoutBtn btn" onClick={handleLogout}>
            LOGOUT
          </button>
        ) : (
          <button className="loginBtn btn" onClick={goToLogin}>
            LOGIN
          </button>
        )}
      </div>

      <div className="hamburger" onClick={() => setShow(!show)} aria-label="Toggle menu">
        <GiHamburgerMenu />
      </div>
    </nav>
  );
};

export default Navbar;
