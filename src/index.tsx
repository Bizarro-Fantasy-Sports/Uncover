import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Auth0Provider } from "@auth0/auth0-react";
import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "./RootLayout";
import AthleteUnknown from "./athlete-unknown/AthleteUnknown";
import ContactForm from "./ContactForm";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        Component: App,
      },
      {
        path: "/daily-fact",
        Component: () => (
          <section className="content">
            <h2>Trivia</h2>
            <p>Did you know that Bizarro has one "Z" and two "R"s?</p>
          </section>
        ),
      },
      {
        path: "/athlete-unknown",
        Component: AthleteUnknown,
      },
      {
        path: "/projects",
        Component: () => (
          <section className="content">
            <h2>Upcoming Projects</h2>
            <p>
              Learn more about some of the new games and features we're working
              on
            </p>
          </section>
        ),
      },
      {
        path: "/contact",
        Component: ContactForm,
      },
    ],
  },
]);

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN!}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <RouterProvider router={router} />
      {/* <App /> */}
    </Auth0Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
