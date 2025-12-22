import React from "react";
import type { SportType } from "../config";

interface SportsReferenceAttributionProps {
  activeSport: SportType;
}

const sportsReferenceUrls: Record<SportType, string> = {
  basketball:
    "https://www.basketball-reference.com/?utm_campaign=2023_07_ig_header_logo&utm_source=ig&utm_medium=sr_xsite&__hstc=213859787.d5011e8d60fd9a5193cb043be2a32532.1764028511872.1764187685470.1764486206944.5&__hssc=213859787.1.1764486206944&__hsfp=2724220660",
  baseball:
    "https://www.baseball-reference.com/?utm_campaign=2023_07_ig_header_logo&utm_source=ig&utm_medium=sr_xsite",
  football:
    "https://www.pro-football-reference.com/?utm_campaign=2023_07_ig_header_logo&utm_source=ig&utm_medium=sr_xsite",
};

const sportLogos: Record<SportType, string> = {
  baseball: "https://cdn.ssref.net/req/202512031/logos/br-logo.svg",
  basketball: "https://cdn.ssref.net/req/202512031/logos/bbr-logo.svg",
  football: "https://cdn.ssref.net/req/202512101/logos/pfr-logo.svg",
};

export const SportsReferenceAttribution: React.FC<
  SportsReferenceAttributionProps
> = ({ activeSport }) => {
  return (
    <div className="sports-reference-attribution">
      <a
        href={sportsReferenceUrls[activeSport]}
        target="_blank"
        rel="noopener noreferrer"
        className="sports-reference-link"
        title={`Data from ${activeSport.charAt(0).toUpperCase() + activeSport.slice(1)} Reference`}
      >
        <img
          src={sportLogos[activeSport]}
          alt={`${activeSport.charAt(0).toUpperCase() + activeSport.slice(1)} Reference`}
          className="sports-reference-logo"
        />
      </a>
    </div>
  );
};
