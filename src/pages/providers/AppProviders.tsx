import React from "react";
import { Auth0Provider } from "./Auth0Provider";
import { RouterProvider } from "./RouterProvider";

interface AppProvidersProps {
  children?: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = () => {
  return (
    <Auth0Provider>
      <RouterProvider />
    </Auth0Provider>
  );
};
