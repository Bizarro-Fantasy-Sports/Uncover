import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { NavLink } from "react-router";
import "./Navbar.css";

function Navbar() {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } =
    useAuth0();

  return (
    <>
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
                  logout({ logoutParams: { returnTo: window.location.origin } })
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
          <NavLink to="/athlete-unknown">Athlete Unknown</NavLink>
          <NavLink to="/projects">Upcoming Projects</NavLink>
          <NavLink to="/contact">Contact Us</NavLink>
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
