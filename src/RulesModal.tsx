import React, { useState } from "react";
import "./RulesModal.css";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tile category tooltips
const tileTooltips: Record<string, string> = {
  Bio: "Gives the birth date and location of the athlete",
  "Player Information":
    "Gives the physical measurements and position of the athlete",
  "Draft Information":
    'Gives the draft information of the athlete, if the player was not acquired via a draft of any kind, the value will be "Undrafted"',
  "Years Active":
    "Gives the years the athlete was active and participated in a major league game that season",
  "Teams Played On":
    "Gives the teams the athlete has played on, in chronological order, but not the duration or years of tenure on each team",
  "Jersey Numbers":
    "Gives the jersey numbers the athlete has worn, in chronological order. Duplicate numbers even if worn on different teams will be removed",
  "Career Stats":
    "High-level career-long stats for the athlete. Varies by sport",
  "Personal Achievements":
    "Lists the following awards (see below) per sport",
  Photo: "Reveals headshot of player",
};

// Acronym definitions
const acronymDefinitions: Record<string, { full: string; link?: string }> = {
  BA: { full: "Batting Average" },
  HR: { full: "Home Runs" },
  SB: { full: "Stolen Bases" },
  WAR: {
    full: "Wins Above Replacement",
    link: "https://www.baseball-reference.com/about/war_explained.shtml",
  },
  PTS: { full: "Points per Game" },
  REB: { full: "Rebounds per Game" },
  AST: { full: "Assists per game" },
  BPM: {
    full: "Box Plus Minus",
    link: "https://www.basketball-reference.com/about/bpm2.html",
  },
  "Pass YDS": { full: "Passing Yards" },
  "Pass TDS": { full: "Passing TDs" },
  INT: { full: "Interceptions" },
  AV: {
    full: "Approximate Value",
    link: "https://www.pro-football-reference.com/about/approximate_value.htm",
  },
  RUSH: { full: "Rushing Attempts" },
  "Rushing YDS": { full: "Rushing Yards" },
  TDS: { full: "Rushing TDs" },
  REC: { full: "Receptions" },
  "Rec YDS": { full: "Receiving Yards" },
  "Rec TDs": { full: "Receiving TDs" },
  GS: { full: "Games Started" },
  "Solo Tackles": { full: "Solo Tackles" },
  Sacks: { full: "Sacks" },
  HOF: { full: "Hall of Fame" },
  "WS Champ": { full: "World Series Champion" },
  MVP: { full: "Most Valuable Player" },
  "Cy Young": { full: "Cy Young Winner" },
  ROY: { full: "Rookie of the Year" },
  "All-Star": { full: "All-Star Appearances" },
  "NBA Champ": { full: "NBA Championship winner" },
  "6MOY": { full: "Sixth Man of the Year" },
  MIPOY: { full: "Most Improved Player of the Year" },
  "All-NBA": { full: "All-NBA team appearance" },
  "All-Defensive": { full: "All-Defensive team appearance" },
  "Finals MVP": { full: "NBA Finals MVP" },
  "Pro-Bowls": { full: "Pro Bowl Appearances" },
  OPOY: { full: "Offensive player of the Year" },
  DPOY: { full: "Defensive player of the Year" },
  "All-Pro": { full: "an All-Pro team appearance" },
  "SB MVP": { full: "Super Bowl MVP" },
};

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);
  const [hoveredAcronym, setHoveredAcronym] = useState<string | null>(null);

  if (!isOpen) return null;

  const renderTileWithTooltip = (tileName: string) => {
    return (
      <span
        className="tile-name-hover"
        onMouseEnter={() => setHoveredTile(tileName)}
        onMouseLeave={() => setHoveredTile(null)}
      >
        {tileName}
        {hoveredTile === tileName && (
          <span className="tooltip">{tileTooltips[tileName]}</span>
        )}
      </span>
    );
  };

  const renderAcronym = (acronym: string, additionalText?: string, uniqueId?: string) => {
    const def = acronymDefinitions[acronym];
    if (!def) {
      return (
        <span>
          {acronym}
          {additionalText && ` ${additionalText}`}
        </span>
      );
    }

    // Create a unique identifier for this specific acronym instance
    const hoverKey = uniqueId || acronym;

    return (
      <span
        className="acronym-hover"
        onMouseEnter={() => setHoveredAcronym(hoverKey)}
        onMouseLeave={() => setHoveredAcronym(null)}
      >
        {acronym}
        {additionalText && ` ${additionalText}`}
        {hoveredAcronym === hoverKey && (
          <span className="tooltip">
            {def.full}
            {def.link && (
              <>
                {" "}
                (
                <a
                  href={def.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tooltip-link"
                >
                  Explanation Article
                </a>
                )
              </>
            )}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="rules-modal-overlay" onClick={onClose}>
      <div className="rules-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-rules-button" onClick={onClose}>
          ×
        </button>

        <h2 className="rules-title">How to Play — Athlete Unknown</h2>

        <div className="rules-body">
          <p className="rules-intro">
            Guess the mystery athlete flipping as few information tiles as
            possible.
          </p>

          <div className="rules-section">
            <h3>Scoring</h3>
            <ul>
              <li>
                <strong>Start:</strong> 100 points
              </li>
              <li>
                <strong>Tile flip:</strong> −3 pts (Photo: −6 pts)
              </li>
              <li>
                <strong>Wrong guess:</strong> −2 pts
              </li>
            </ul>
          </div>

          <div className="rules-section">
            <h3>Hints & Help</h3>
            <ul>
              <li>Close spelling = hint / auto-correct after multiple close attempts</li>
              <li>Stuck & &lt;80 pts = initials revealed</li>
              <li>
                Difficulty increases Mon → Sat; Sundays are themed
              </li>
            </ul>
          </div>

          <div className="rules-section">
            <h3>Tile Information</h3>
            <p className="tiles-intro">
              Each tile reveals info about the athlete:
            </p>
            <div className="tiles-list">
              {renderTileWithTooltip("Bio")} •{" "}
              {renderTileWithTooltip("Player Information")} •{" "}
              {renderTileWithTooltip("Draft Information")} •{" "}
              {renderTileWithTooltip("Years Active")} •{" "}
              {renderTileWithTooltip("Teams Played On")} •{" "}
              {renderTileWithTooltip("Jersey Numbers")} •{" "}
              {renderTileWithTooltip("Career Stats")} •{" "}
              {renderTileWithTooltip("Personal Achievements")} •{" "}
              {renderTileWithTooltip("Photo")}
            </div>
          </div>

          <div className="rules-section">
            <h3>Career Stats by Sport</h3>

            <div className="sport-stats">
              <h4>Baseball</h4>
              <ul>
                <li>{renderAcronym("BA", undefined, "baseball-ba")}</li>
                <li>{renderAcronym("HR", undefined, "baseball-hr")}</li>
                <li>{renderAcronym("SB", undefined, "baseball-sb")}</li>
                <li>{renderAcronym("WAR", undefined, "baseball-war")}</li>
              </ul>
            </div>

            <div className="sport-stats">
              <h4>Basketball</h4>
              <ul>
                <li>{renderAcronym("PTS", undefined, "basketball-pts")}</li>
                <li>{renderAcronym("REB", undefined, "basketball-reb")}</li>
                <li>{renderAcronym("AST", undefined, "basketball-ast")}</li>
                <li>{renderAcronym("BPM", undefined, "basketball-bpm")}</li>
              </ul>
            </div>

            <div className="sport-stats">
              <h4>Football</h4>

              <div className="position-group">
                <h5>Quarterback</h5>
                <ul>
                  <li>{renderAcronym("Pass YDS", undefined, "football-qb-passyds")}</li>
                  <li>{renderAcronym("Pass TDS", undefined, "football-qb-passtds")}</li>
                  <li>{renderAcronym("INT", undefined, "football-qb-int")}</li>
                  <li>{renderAcronym("AV", undefined, "football-qb-av")}</li>
                </ul>
              </div>

              <div className="position-group">
                <h5>Running Back</h5>
                <ul>
                  <li>{renderAcronym("RUSH", undefined, "football-rb-rush")}</li>
                  <li>{renderAcronym("Rushing YDS", undefined, "football-rb-rushingyds")}</li>
                  <li>{renderAcronym("TDS", undefined, "football-rb-tds")}</li>
                  <li>{renderAcronym("AV", undefined, "football-rb-av")}</li>
                </ul>
              </div>

              <div className="position-group">
                <h5>Wide Receiver & Tight End</h5>
                <ul>
                  <li>{renderAcronym("REC", undefined, "football-wr-rec")}</li>
                  <li>{renderAcronym("Rec YDS", undefined, "football-wr-recyds")}</li>
                  <li>{renderAcronym("Rec TDs", undefined, "football-wr-rectds")}</li>
                  <li>{renderAcronym("AV", undefined, "football-wr-av")}</li>
                </ul>
              </div>

              <div className="position-group">
                <h5>Offensive Line</h5>
                <ul>
                  <li>{renderAcronym("GS", undefined, "football-ol-gs")}</li>
                  <li>{renderAcronym("AV", undefined, "football-ol-av")}</li>
                </ul>
              </div>

              <div className="position-group">
                <h5>Defensive Line</h5>
                <ul>
                  <li>{renderAcronym("GS", undefined, "football-dl-gs")}</li>
                  <li>{renderAcronym("Solo Tackles", undefined, "football-dl-tackles")}</li>
                  <li>{renderAcronym("Sacks", undefined, "football-dl-sacks")}</li>
                  <li>{renderAcronym("AV", undefined, "football-dl-av")}</li>
                </ul>
              </div>

              <div className="position-group">
                <h5>Defensive Back</h5>
                <ul>
                  <li>{renderAcronym("GS", undefined, "football-db-gs")}</li>
                  <li>{renderAcronym("Solo Tackles", undefined, "football-db-tackles")}</li>
                  <li>{renderAcronym("INT", undefined, "football-db-int")}</li>
                  <li>{renderAcronym("AV", undefined, "football-db-av")}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rules-section">
            <h3>Personal Achievements by Sport</h3>

            <div className="sport-stats">
              <h4>Baseball</h4>
              <ul>
                <li>{renderAcronym("HOF", undefined, "baseball-hof")}</li>
                <li>{renderAcronym("WS Champ", undefined, "baseball-wschamp")}</li>
                <li>{renderAcronym("MVP", undefined, "baseball-mvp")}</li>
                <li>{renderAcronym("Cy Young", undefined, "baseball-cyyoung")}</li>
                <li>{renderAcronym("ROY", undefined, "baseball-roy")}</li>
                <li>{renderAcronym("All-Star", undefined, "baseball-allstar")}</li>
              </ul>
            </div>

            <div className="sport-stats">
              <h4>Basketball</h4>
              <ul>
                <li>{renderAcronym("HOF", undefined, "basketball-hof")}</li>
                <li>{renderAcronym("NBA Champ", undefined, "basketball-nbachamp")}</li>
                <li>{renderAcronym("MVP", undefined, "basketball-mvp")}</li>
                <li>{renderAcronym("ROY", undefined, "basketball-roy")}</li>
                <li>{renderAcronym("6MOY", undefined, "basketball-6moy")}</li>
                <li>{renderAcronym("MIPOY", undefined, "basketball-mipoy")}</li>
                <li>{renderAcronym("All-NBA", undefined, "basketball-allnba")}</li>
                <li>{renderAcronym("All-Defensive", undefined, "basketball-alldefensive")}</li>
                <li>{renderAcronym("Finals MVP", undefined, "basketball-finalsmvp")}</li>
                <li>{renderAcronym("All-Star", undefined, "basketball-allstar")}</li>
              </ul>
            </div>

            <div className="sport-stats">
              <h4>Football</h4>
              <ul>
                <li>{renderAcronym("HOF", undefined, "football-hof")}</li>
                <li>{renderAcronym("Pro-Bowls", undefined, "football-probowls")}</li>
                <li>{renderAcronym("OPOY", undefined, "football-opoy")}</li>
                <li>{renderAcronym("DPOY", undefined, "football-dpoy")}</li>
                <li>{renderAcronym("ROY", undefined, "football-roy")}</li>
                <li>{renderAcronym("All-Pro", undefined, "football-allpro")}</li>
                <li>{renderAcronym("SB MVP", undefined, "football-sbmvp")}</li>
              </ul>
            </div>
          </div>

          <p className="rules-footer">
            Share your score and play again tomorrow!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
