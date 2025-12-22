import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserStatsModal } from "./UserStatsModal";

describe("UserStatsModal Component", () => {
  beforeEach(() => {
    render(<UserStatsModal />);
  });

  it("renders the component with title", () => {
    expect(screen.getByText("User Statistics")).toBeInTheDocument();
  });

  it("displays user information", () => {
    expect(screen.getByText(/User:/)).toBeInTheDocument();
    expect(screen.getByText(/Member Since:/)).toBeInTheDocument();
    expect(screen.getByText(/FirstTestProdUser123/)).toBeInTheDocument();
  });

  it("renders sport selector buttons", () => {
    expect(screen.getByText("Basketball")).toBeInTheDocument();
    expect(screen.getByText("Baseball")).toBeInTheDocument();
    expect(screen.getByText("Football")).toBeInTheDocument();
  });

  it("displays basketball stats by default", () => {
    expect(screen.getByText("10")).toBeInTheDocument(); // Total Plays for basketball
    expect(screen.getByText("81%")).toBeInTheDocument(); // Accuracy for basketball
    expect(screen.getByText("70")).toBeInTheDocument(); // Average Score
    expect(screen.getByText("90")).toBeInTheDocument(); // Highest Score
    expect(screen.getByText("3")).toBeInTheDocument(); // Current Streak for basketball
  });

  it("switches to baseball stats when baseball button is clicked", () => {
    const baseballButton = screen.getByText("Baseball");
    fireEvent.click(baseballButton);

    // Basketball has 10 total plays, baseball has 30
    expect(screen.getByText("30")).toBeInTheDocument(); // Total Plays for baseball
    expect(screen.getByText("82%")).toBeInTheDocument(); // Accuracy for baseball
    expect(screen.getByText("5")).toBeInTheDocument(); // Current Streak for baseball
  });

  it("switches to football stats when football button is clicked", () => {
    const footballButton = screen.getByText("Football");
    fireEvent.click(footballButton);

    // Football has current streak of 7
    expect(screen.getByText("30")).toBeInTheDocument(); // Total Plays for football
    expect(screen.getByText("83%")).toBeInTheDocument(); // Accuracy for football
    expect(screen.getByText("7")).toBeInTheDocument(); // Current Streak for football
  });

  it("displays overview stat labels", () => {
    expect(screen.getByText("Total Plays")).toBeInTheDocument();
    expect(screen.getByText("Accuracy")).toBeInTheDocument();
    expect(screen.getByText("Average Score")).toBeInTheDocument();
    expect(screen.getByText("Highest Score")).toBeInTheDocument();
    expect(screen.getByText("Current Streak")).toBeInTheDocument();
  });

  it("displays tile patterns section", () => {
    expect(screen.getByText("Tile Patterns")).toBeInTheDocument();
    expect(screen.getByText("Most Common")).toBeInTheDocument();
    expect(screen.getByText("Least Common")).toBeInTheDocument();
  });

  it("displays tile pattern details", () => {
    expect(screen.getByText("First Tile:")).toBeInTheDocument();
    expect(screen.getByText("Most Flipped:")).toBeInTheDocument();
    expect(screen.getByText("Last Tile:")).toBeInTheDocument();
    expect(screen.getAllByText(/Player Information/).length).toBeGreaterThan(0); // Most common first tile
    expect(screen.getAllByText(/Career Stats/).length).toBeGreaterThan(0); // Most common tile flipped
  });

  it("displays tile flip details table", () => {
    expect(screen.getByText("Tile Flip Details")).toBeInTheDocument();
    expect(screen.getByText("Tile Type")).toBeInTheDocument();
    expect(screen.getByText("First Flipped")).toBeInTheDocument();
    expect(screen.getByText("Last Flipped")).toBeInTheDocument();
    expect(screen.getByText("Most Flipped")).toBeInTheDocument();
  });

  it("displays all tile types in the table", () => {
    expect(screen.getAllByText("Bio").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Career Stats").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Draft Information").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Jersey Numbers").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Personal Achievements").length).toBeGreaterThan(
      0
    );
    expect(screen.getAllByText("Photo").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Player Information").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Teams Played On").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Years Active").length).toBeGreaterThan(0);
  });

  it("highlights the active sport button", () => {
    const basketballButton = screen.getByText("Basketball");
    expect(basketballButton).toHaveClass("active");

    const baseballButton = screen.getByText("Baseball");
    expect(baseballButton).not.toHaveClass("active");

    fireEvent.click(baseballButton);
    expect(baseballButton).toHaveClass("active");
    expect(basketballButton).not.toHaveClass("active");
  });

  it("formats tile names correctly", () => {
    // Checks that camelCase is converted to readable format
    expect(screen.getAllByText("Player Information").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Career Stats").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Draft Information").length).toBeGreaterThan(0);
  });

  it("displays correct streak for each sport", () => {
    // Basketball: 3
    expect(screen.getByText("3")).toBeInTheDocument();

    // Switch to Baseball: 5
    const baseballButton = screen.getByText("Baseball");
    fireEvent.click(baseballButton);
    expect(screen.getByText("5")).toBeInTheDocument();

    // Switch to Football: 7
    const footballButton = screen.getByText("Football");
    fireEvent.click(footballButton);
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});
