import React from "react";
import {
  createBrowserRouter,
  RouterProvider as RouterProviderBase,
} from "react-router";
import { RootLayout, Home, AthleteUnknown, ContactForm } from "@/pages/routes";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        Component: Home,
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

export function RouterProvider(): React.ReactElement {
  return <RouterProviderBase router={router} />;
}
