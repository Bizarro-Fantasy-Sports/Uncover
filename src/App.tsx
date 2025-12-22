import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./App.css";
import ContactForm from "./ContactForm";
import AthleteUnknown from "./athlete-unknown/AthleteUnknown";
import { athleteUnknownApiService } from "./athlete-unknown/services/api";

type PageType =
  | "Home"
  | "Daily Fact"
  | "Athlete Unknown"
  | "Projects"
  | "Contact";

function App() {
  const [activePage, setActivePage] = useState<PageType>("Home");
  const {
    getAccessTokenSilently,
    loginWithRedirect,
    logout,
    isAuthenticated,
    user,
    isLoading,
  } = useAuth0();

  // Initialize API service with Auth0 token function
  useEffect(() => {
    athleteUnknownApiService.setGetAccessToken(getAccessTokenSilently);
  }, [getAccessTokenSilently]);

  const renderPage = () => {
    switch (activePage) {
      case "Home":
        return (
          <div>
            <section className="content">
              <h2>Home</h2>
              <p> Welcome to the Bizarro Fantasy Sports Home Page!</p>
            </section>
            <section className="content">
              <h2>News</h2>
              <p> Upcoming: New "Athlete Unknown" trivia game</p>
            </section>
          </div>
        );
      case "Daily Fact":
        return (
          <section className="content">
            <h2>Trivia</h2>
            <p>Did you know that Bizarro has one "Z" and two "R"s?</p>
          </section>
        );
      case "Athlete Unknown":
        return (
          <AthleteUnknown />
          // <section className="content">
          //   <h2>Athlete Unknown</h2>
          //   <h3>Try to guess the player! </h3>
          //   <p>
          //     Click on a tile to turn it over for player information. Once
          //     you've figured out who the player is, guess in the text box above.
          //     Try to use as few tiles as possible and compare your results with
          //     your friends!
          //   </p>
          // </section>
        );
      case "Projects":
        return (
          <section className="content">
            <h2>Upcoming Projects</h2>
            <p>
              Learn more about some of the new games and features we're working
              on
            </p>
          </section>
        );
      case "Contact":
        return (
          <section className="content">
            <ContactForm />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
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
          <li
            className={activePage === "Home" ? "active" : ""}
            onClick={() => setActivePage("Home")}
          >
            Home
          </li>
          <li
            className={activePage === "Daily Fact" ? "active" : ""}
            onClick={() => setActivePage("Daily Fact")}
          >
            Daily Fact
          </li>
          <li
            className={activePage === "Athlete Unknown" ? "active" : ""}
            onClick={() => setActivePage("Athlete Unknown")}
          >
            Athlete Unknown
          </li>
          <li
            className={activePage === "Projects" ? "active" : ""}
            onClick={() => setActivePage("Projects")}
          >
            Upcoming Projects
          </li>
          <li
            className={activePage === "Contact" ? "active" : ""}
            onClick={() => setActivePage("Contact")}
          >
            Contact Us
          </li>
        </ul>
      </nav>

      {renderPage()}

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} Bizarro Fantasy Sports. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;
