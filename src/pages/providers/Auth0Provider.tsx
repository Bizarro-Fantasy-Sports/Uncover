import React from "react";
import { Auth0Provider as Auth0ProviderBase } from "@auth0/auth0-react";

interface Auth0ProviderProps {
  children: React.ReactNode;
}

export function Auth0Provider({ children }: Auth0ProviderProps): React.ReactElement {
  return (
    <Auth0ProviderBase
      domain={process.env.REACT_APP_AUTH0_DOMAIN!}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0ProviderBase>
  );
}
