import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link, NavLink } from "react-router";
import "./Navbar.css";
import Logo from "./placeholder-logo.png";
import { UserAndSettings } from "@/features";

function Navbar() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } =
    useAuth0();

  return (
    <>
      {/* <div className="desktop-navbar-container">
        <header className="header">
          <div>
            <h1 className="site-title">Bizarro Fantasy Sports</h1>
            <p className="tagline">Daily Fantasy Sports Games</p>
          </div>
          <div className="auth-section">
            {isLoading ? (
              <span>Loading...</span>
            ) : isAuthenticated ? (
              <div className="user-info">
                <span>Welcome, {user?.name || user?.email}</span>
                <button
                  onClick={() =>
                    logout({
                      logoutParams: { returnTo: window.location.origin },
                    })
                  }
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button onClick={() => loginWithRedirect()}>Log In</button>
            )}
          </div>
        </header>

        <nav className="navbar">
          <ul className="nav-links">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/daily-fact">Daily Fact</NavLink>
            <Link to="/athlete-unknown">
              {"Athlete Unknown Default -> Baseball"}
            </Link>
            <NavLink to="/athlete-unknown/baseball">AU Baseball</NavLink>
            <NavLink to="/athlete-unknown/basketball">AU Basketball</NavLink>
            <NavLink to="/athlete-unknown/football">AU Football</NavLink>
            <NavLink to="/projects">Upcoming Projects</NavLink>
            <NavLink to="/contact">Contact Us</NavLink>
          </ul>
        </nav>
      </div> */}
      <div className="mobile-navbar-container">
        <div className="navbar-logo-container">
          <NavLink to="/">
            <img src={Logo} alt={"logo"} className="navbar-logo" />
          </NavLink>
        </div>
      </div>
    </>
  );
}

export { Navbar };
