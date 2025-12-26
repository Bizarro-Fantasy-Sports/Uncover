import React from "react";
import { Auth0Provider } from "./Auth0Provider";
import { RouterProvider } from "./RouterProvider";

export function AppProviders(): React.ReactElement {
  return (
    <Auth0Provider>
      <RouterProvider />
    </Auth0Provider>
  );
}
