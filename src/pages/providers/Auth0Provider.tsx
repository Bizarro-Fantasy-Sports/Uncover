import React from "react";
import { Auth0Provider as Auth0ProviderBase } from "@auth0/auth0-react";
import { config } from "@/config/env";

interface Auth0ProviderProps {
  children: React.ReactNode;
}

export function Auth0Provider({ children }: Auth0ProviderProps): React.ReactElement {
  return (
    <Auth0ProviderBase
      domain={config.auth0.domain}
      clientId={config.auth0.clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: config.auth0.audience,
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0ProviderBase>
  );
}
