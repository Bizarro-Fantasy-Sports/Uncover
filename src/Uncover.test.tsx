import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Uncover from "./Uncover";

// Mock CSS imports
jest.mock("./Uncover.css", () => ({}));
jest.mock("./TodayStatsModal.css", () => ({}));

// Mock fetch
global.fetch = jest.fn() as jest.Mock;

interface LocalStorageMock {
  getItem: jest.Mock;
  setItem: jest.Mock;
  clear: jest.Mock;
}

// Mock localStorage
const localStorageMock = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  } as LocalStorageMock;
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

interface PlayerData {
  Name: string;
  Bio: string;
  "Player Information": string;
  "Draft Information": string;
  "Years Active": string;
  "Teams Played On": string;
  "Jersey Numbers": string;
  "Career Stats": string;
  "Personal Achievements": string;
  Photo: string[];
}

interface Player {
  sport: string;
  sportsReferencePath: string;
  name: string;
  bio: string;
  playerInformation: string;
  draftInformation: string;
  yearsActive: string;
  teamsPlayedOn: string;
  jerseyNumbers: string;
  careerStats: string;
  personalAchievements: string;
  photo: string;
}

interface TileTracker {
  bio: number;
  careerStats: number;
  draftInformation: number;
  jerseyNumbers: number;
  personalAchievements: number;
  photo: number;
  playerInformation: number;
  teamsPlayedOn: number;
  yearsActive: number;
}

interface RoundStats {
  playDate: string;
  sport: string;
  name: string;
  totalPlays: number;
  percentageCorrect: number;
  averageScore: number;
  averageCorrectScore: number;
  highestScore: number;
  mostCommonFirstTileFlipped: string;
  mostCommonLastTileFlipped: string;
  mostCommonTileFlipped: string;
  leastCommonTileFlipped: string;
  mostFlippedTracker: TileTracker;
  firstFlippedTracker: TileTracker;
  lastFlippedTracker: TileTracker;
}

interface RoundData {
  playDate: string;
  sport: string;
  roundId: string;
  created: string;
  lastUpdated: string;
  previouslyPlayedDates: string[];
  player: Player;
  stats: RoundStats;
}

// Helper function to create mock round data from player data
const createMockRoundData = (
  playerName: string,
  playerBio: string,
  playerInfo: string,
  draftInfo: string,
  yearsActive: string,
  teams: string,
  jerseys: string,
  stats: string,
  achievements: string,
  photo: string,
  sport: string,
  roundNumber: number
): RoundData => ({
  playDate: "2025-11-19",
  sport,
  roundId: `${sport}${String(roundNumber).padStart(3, "0")}`,
  created: "2025-11-11T10:00:00Z",
  lastUpdated: "2025-11-12T00:00:00Z",
  previouslyPlayedDates: [],
  player: {
    sport,
    sportsReferencePath: "test/path",
    name: playerName,
    bio: playerBio,
    playerInformation: playerInfo,
    draftInformation: draftInfo,
    yearsActive,
    teamsPlayedOn: teams,
    jerseyNumbers: jerseys,
    careerStats: stats,
    personalAchievements: achievements,
    photo,
  },
  stats: {
    playDate: "2025-11-19",
    sport,
    name: playerName,
    totalPlays: 100,
    percentageCorrect: 75,
    averageScore: 55,
    averageCorrectScore: 85,
    highestScore: 100,
    mostCommonFirstTileFlipped: "playerInformation",
    mostCommonLastTileFlipped: "photo",
    mostCommonTileFlipped: "careerStats",
    leastCommonTileFlipped: "bio",
    mostFlippedTracker: {
      bio: 10,
      careerStats: 50,
      draftInformation: 30,
      jerseyNumbers: 20,
      personalAchievements: 40,
      photo: 60,
      playerInformation: 45,
      teamsPlayedOn: 35,
      yearsActive: 25,
    },
    firstFlippedTracker: {
      bio: 5,
      careerStats: 15,
      draftInformation: 10,
      jerseyNumbers: 8,
      personalAchievements: 12,
      photo: 3,
      playerInformation: 25,
      teamsPlayedOn: 12,
      yearsActive: 10,
    },
    lastFlippedTracker: {
      bio: 8,
      careerStats: 10,
      draftInformation: 7,
      jerseyNumbers: 9,
      personalAchievements: 11,
      photo: 42,
      playerInformation: 4,
      teamsPlayedOn: 5,
      yearsActive: 4,
    },
  },
});

// Sample test data
const mockBaseballData: RoundData[] = [
  createMockRoundData(
    "Babe Ruth",
    "Greatest baseball player",
    "Outfielder/Pitcher",
    "Signed 1914",
    "1914-1935",
    "Red Sox, Yankees, Braves",
    "3",
    "714 HR, .342 AVG",
    "7 World Series, 2 MVP",
    "/images/babe-ruth.jpg",
    "baseball",
    1
  ),
  createMockRoundData(
    "Jackie Robinson",
    "Broke color barrier",
    "Second Baseman",
    "Signed 1945",
    "1947-1956",
    "Brooklyn Dodgers",
    "42",
    ".311 AVG, 137 HR",
    "ROY 1947, MVP 1949",
    "/images/jackie-robinson.jpg",
    "baseball",
    2
  ),
];

describe("Uncover Component", () => {
  beforeEach(() => {
    // Clear call history but preserve mock implementations
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();

    // Reset localStorage store
    localStorageMock.clear();

    // Setup default fetch mock
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => mockBaseballData,
    });
  });

  describe("Component Rendering", () => {
    test("renders loading state initially", () => {
      render(<Uncover />);
      expect(screen.getByText(/loading player data/i)).toBeInTheDocument();
    });

    test("renders sport navigation tabs", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASEBALL")).toBeInTheDocument();
        expect(screen.getByText("BASKETBALL")).toBeInTheDocument();
        expect(screen.getByText("FOOTBALL")).toBeInTheDocument();
      });
    });

    test("renders all topic tiles", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("Bio")).toBeInTheDocument();
        expect(screen.getByText("Player Information")).toBeInTheDocument();
        expect(screen.getByText("Draft Information")).toBeInTheDocument();
        expect(screen.getByText("Years Active")).toBeInTheDocument();
        expect(screen.getByText("Teams Played On")).toBeInTheDocument();
        expect(screen.getByText("Jersey Numbers")).toBeInTheDocument();
        expect(screen.getByText("Career Stats")).toBeInTheDocument();
        expect(screen.getByText("Personal Achievements")).toBeInTheDocument();
        expect(screen.getByText("Photo")).toBeInTheDocument();
      });
    });

    test("renders player input and submit button", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /submit/i })
        ).toBeInTheDocument();
      });
    });

    test("displays initial score of 100", async () => {
      render(<Uncover />);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("100");
      });
    });

    test("displays initial tiles flipped count of 0", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 0/i)).toBeInTheDocument();
      });
    });
  });

  describe("Data Loading", () => {
    test("fetches baseball data on mount", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/UncoverBaseballData.json");
      });
    });

    test("uses localStorage to track player index", async () => {
      render(<Uncover />);

      // Wait for component to load and make localStorage calls
      await waitFor(() => {
        expect(localStorageMock.getItem).toHaveBeenCalledWith(
          "playerIndex_baseball"
        );
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "playerIndex_baseball",
          "1"
        );
      });
    });

    test("loads basketball data when basketball tab is clicked", async () => {
      const mockBasketballData: RoundData[] = [
        createMockRoundData(
          "Michael Jordan",
          "GOAT",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "/mj.jpg",
          "basketball",
          1
        ),
      ];
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => mockBaseballData,
        })
        .mockResolvedValueOnce({
          json: async () => mockBasketballData,
        });

      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASKETBALL")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("BASKETBALL"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/UncoverBasketballData.json"
        );
      });
    });

    test("cycles through player index correctly", async () => {
      // Set index to last player (1)
      localStorageMock.getItem.mockReturnValueOnce("1");

      render(<Uncover />);

      await waitFor(() => {
        // Should wrap around to 0
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "playerIndex_baseball",
          "0"
        );
      });
    });
  });

  describe("Player Name Guessing", () => {
    test("correct guess shows success message", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right/i)).toBeInTheDocument();
      });
    });

    test("correct guess is case-insensitive", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "babe ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right/i)).toBeInTheDocument();
      });
    });

    test("correct guess ignores spaces", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "BabeRuth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right/i)).toBeInTheDocument();
      });
    });

    test("wrong guess shows error message", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Wrong Name" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/wrong guess/i)).toBeInTheDocument();
      });
    });

    test("close guess (distance <= 2) shows almost message", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Rut" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you're close/i)).toBeInTheDocument();
      });
    });

    test("second close guess reveals player name", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // First close guess
      fireEvent.change(input, { target: { value: "Babe Rut" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you're close/i)).toBeInTheDocument();
      });

      // Second different close guess
      fireEvent.change(input, { target: { value: "Babe Ruh" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Babe Ruth/i)).toBeInTheDocument();
      });
    });

    test("wrong guess decreases score by 2", async () => {
      render(<Uncover />);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("100");
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Wrong Name" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("98");
      });
    });

    test("cannot submit the same incorrect guess consecutively", async () => {
      render(<Uncover />);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("100");
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // First submission
      fireEvent.change(input, { target: { value: "Wrong Name" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("98");
      });

      // Try to submit the same guess again - should not change score
      fireEvent.click(submitButton);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("98");
      });
    });

    test("can submit different guess after incorrect guess", async () => {
      render(<Uncover />);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("100");
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // First wrong guess
      fireEvent.change(input, { target: { value: "Wrong Name 1" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("98");
      });

      // Different wrong guess - should work
      fireEvent.change(input, { target: { value: "Wrong Name 2" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("96");
      });
    });

    test("consecutive guess check is case-insensitive and space-insensitive", async () => {
      render(<Uncover />);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("100");
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // First submission
      fireEvent.change(input, { target: { value: "wrong name" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("98");
      });

      // Try to submit with different case and spacing
      fireEvent.change(input, { target: { value: "WRONG NAME" } });
      fireEvent.click(submitButton);

      // Should be blocked, score should remain 98
      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("98");
      });

      // Try with different spacing
      fireEvent.change(input, { target: { value: "wrongname" } });
      fireEvent.click(submitButton);

      // Should still be blocked, score should remain 98
      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("98");
      });
    });
  });

  describe("Tile Flipping", () => {
    test("clicking a tile flips it and reveals content", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("Bio")).toBeInTheDocument();
      });

      const bioTile = screen.getByText("Bio").closest(".tile");
      fireEvent.click(bioTile!);

      await waitFor(() => {
        expect(
          screen.getByText("Greatest baseball player")
        ).toBeInTheDocument();
      });
    });

    test("flipping a tile increases tiles flipped count", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 0/i)).toBeInTheDocument();
      });

      const bioTile = screen.getByText("Bio").closest(".tile");
      fireEvent.click(bioTile!);

      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 1/i)).toBeInTheDocument();
      });
    });

    test("flipping a regular tile decreases score by 3", async () => {
      render(<Uncover />);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("100");
      });

      const bioTile = screen.getByText("Bio").closest(".tile");
      fireEvent.click(bioTile!);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("97");
      });
    });

    test("flipping photo tile decreases score by 6", async () => {
      render(<Uncover />);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("100");
      });

      const photoTile = screen.getByText("Photo").closest(".tile");
      fireEvent.click(photoTile!);

      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("94");
      });
    });

    test("clicking already flipped tile does not change score", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("Bio")).toBeInTheDocument();
      });

      const bioTile = screen.getByText("Bio").closest(".tile");

      // First click
      fireEvent.click(bioTile!);
      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("97");
      });

      // Second click on same tile
      fireEvent.click(bioTile!);
      await waitFor(() => {
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("97");
      });
    });
  });

  describe("Photo Puzzle", () => {
    test("clicking photo tile reveals photo puzzle", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("Photo")).toBeInTheDocument();
      });

      const photoTile = screen.getByText("Photo").closest(".tile");
      fireEvent.click(photoTile!);

      await waitFor(() => {
        // Check that tiles have photo-reveal class
        const photoRevealTiles = document.querySelectorAll(".photo-reveal");
        expect(photoRevealTiles.length).toBeGreaterThan(0);
      });
    });

    test("clicking after photo reveal returns to normal view", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("Photo")).toBeInTheDocument();
      });

      const photoTile = screen.getByText("Photo").closest(".tile");

      // First click reveals photo puzzle
      fireEvent.click(photoTile!);

      await waitFor(() => {
        const photoRevealTiles = document.querySelectorAll(".photo-reveal");
        expect(photoRevealTiles.length).toBeGreaterThan(0);
      });

      // Second click anywhere returns to normal
      const anyTile = document.querySelector(".tile");
      fireEvent.click(anyTile!);

      await waitFor(() => {
        const returningTiles = document.querySelectorAll(".returning-from-photo");
        expect(returningTiles.length).toBeGreaterThan(0);
      });
    });

    test("photo puzzle shows background images on tiles", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("Photo")).toBeInTheDocument();
      });

      const photoTile = screen.getByText("Photo").closest(".tile");
      fireEvent.click(photoTile!);

      await waitFor(() => {
        // Check that photo segments have background styles
        const photoSegments = document.querySelectorAll(".photo-segment");
        expect(photoSegments.length).toBeGreaterThan(0);

        // Verify at least one has a background-image style
        const hasBackgroundImage = Array.from(photoSegments).some(
          segment => (segment as HTMLElement).style.backgroundImage.includes("url")
        );
        expect(hasBackgroundImage).toBe(true);
      });
    });
  });

  describe("Hint System", () => {
    test("hint appears when score drops below 70", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Make 16 wrong guesses to drop score below 70 (100 - 32 = 68)
      for (let i = 0; i < 16; i++) {
        fireEvent.change(input, { target: { value: `Wrong ${i}` } });
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(screen.getByText(/hint: player initials/i)).toBeInTheDocument();
        expect(screen.getByText(/B\.R/)).toBeInTheDocument();
      });
    });

    test("hint shows correct initials format", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Drop score below 70
      for (let i = 0; i < 16; i++) {
        fireEvent.change(input, { target: { value: `Wrong ${i}` } });
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        const hintText = screen.getByText(/B\.R/);
        expect(hintText).toBeInTheDocument();
      });
    });
  });

  describe("Ranking System", () => {
    test("displays Amazing rank for score >= 95", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Make 2 wrong guesses (score = 96) then correct
      fireEvent.change(input, { target: { value: "Wrong 1" } });
      fireEvent.click(submitButton);
      fireEvent.change(input, { target: { value: "Wrong 2" } });
      fireEvent.click(submitButton);

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/your rank: amazing/i)).toBeInTheDocument();
      });
    });

    test("displays Elite rank for score >= 90 and < 95", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Make 5 wrong guesses (score = 90) then correct
      for (let i = 0; i < 5; i++) {
        fireEvent.change(input, { target: { value: `Wrong ${i}` } });
        fireEvent.click(submitButton);
      }

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/your rank: elite/i)).toBeInTheDocument();
      });
    });

    test("displays Solid rank for score >= 80 and < 90", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Make 10 wrong guesses (score = 80) then correct
      for (let i = 0; i < 10; i++) {
        fireEvent.change(input, { target: { value: `Wrong ${i}` } });
        fireEvent.click(submitButton);
      }

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/your rank: solid/i)).toBeInTheDocument();
      });
    });

    test("displays no rank for score < 80", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Make 11 wrong guesses (score = 78) then correct
      for (let i = 0; i < 11; i++) {
        fireEvent.change(input, { target: { value: `Wrong ${i}` } });
        fireEvent.click(submitButton);
      }

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/your rank:/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Sport Switching", () => {
    test("switching sports loads new player data", async () => {
      const mockFootballData: RoundData[] = [
        createMockRoundData(
          "Tom Brady",
          "QB GOAT",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "/tb.jpg",
          "football",
          1
        ),
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => mockBaseballData })
        .mockResolvedValueOnce({ json: async () => mockFootballData });

      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("FOOTBALL")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("FOOTBALL"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/UncoverFootballData.json");
      });
    });

    test("each sport maintains separate game state", async () => {
      const mockBasketballData: RoundData[] = [
        createMockRoundData(
          "LeBron James",
          "King",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "/lbj.jpg",
          "basketball",
          1
        ),
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => mockBaseballData })
        .mockResolvedValueOnce({ json: async () => mockBasketballData });

      render(<Uncover />);

      // Wait for baseball to load
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      // Flip a tile in baseball
      const bioTile = screen.getByText("Bio").closest(".tile");
      fireEvent.click(bioTile!);

      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 1/i)).toBeInTheDocument();
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("97");
      });

      // Switch to basketball
      fireEvent.click(screen.getByText("BASKETBALL"));

      // Basketball should have fresh state
      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 0/i)).toBeInTheDocument();
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("100");
      });

      // Switch back to baseball
      fireEvent.click(screen.getByText("BASEBALL"));

      // Baseball state should be preserved
      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 1/i)).toBeInTheDocument();
        const scoreBox = document.querySelector(".score-box");
        expect(scoreBox).toHaveTextContent("97");
      });
    });
  });

  describe("Levenshtein Distance Helper", () => {
    test("lev function calculates correct distance", () => {
      const { lev } = require("./Uncover");

      // Test exact match
      expect(lev("test", "test")).toBe(0);

      // Test single character difference
      expect(lev("test", "best")).toBe(1);

      // Test insertion
      expect(lev("test", "tests")).toBe(1);

      // Test deletion
      expect(lev("test", "tes")).toBe(1);

      // Test multiple differences
      expect(lev("kitten", "sitting")).toBe(3);

      // Test empty strings
      expect(lev("", "test")).toBe(4);
      expect(lev("test", "")).toBe(4);
    });
  });

  describe("Results Modal", () => {
    test("results modal appears on correct answer", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /view results/i })).toBeInTheDocument();
      });

      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });
    });

    test("results modal displays correct score", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Make 2 wrong guesses (score = 96)
      fireEvent.change(input, { target: { value: "Wrong 1" } });
      fireEvent.click(submitButton);
      fireEvent.change(input, { target: { value: "Wrong 2" } });
      fireEvent.click(submitButton);

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /view results/i })).toBeInTheDocument();
      });

      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        expect(screen.getByText(/correct! your score is 96!/i)).toBeInTheDocument();
      });
    });

    test("results modal displays average score", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /view results/i })).toBeInTheDocument();
      });

      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        expect(screen.getByText(/the average score today is 55/i)).toBeInTheDocument();
      });
    });

    test("results modal displays 3x3 grid of tiles", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /view results/i })).toBeInTheDocument();
      });

      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        const resultsTiles = document.querySelectorAll(".results-tile");
        expect(resultsTiles.length).toBe(9);
      });
    });

    test("results modal shows flip symbol (↻) on flipped tiles", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("Bio")).toBeInTheDocument();
      });

      // Flip a tile
      const bioTile = screen.getByText("Bio").closest(".tile");
      fireEvent.click(bioTile!);

      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 1/i)).toBeInTheDocument();
      });

      // Submit correct answer
      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /view results/i })).toBeInTheDocument();
      });

      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        const resultsTiles = document.querySelectorAll(".results-tile.flipped");
        expect(resultsTiles.length).toBeGreaterThan(0);
        expect(resultsTiles[0]).toHaveTextContent("↻");
      });
    });

    test("results modal can be closed and reopened", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /view results/i })).toBeInTheDocument();
      });

      let viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole("button", { name: /✕/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText(/correct! your score is/i)).not.toBeInTheDocument();
      });

      // Reopen modal by clicking View Results button
      viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      });
    });

    test("results modal has share button", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /view results/i })).toBeInTheDocument();
      });

      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
      });
    });
  });

  describe("Share Functionality", () => {
    beforeEach(() => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn(() => Promise.resolve()),
        },
      });
    });

    test("share button copies grid to clipboard", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /view results/i })).toBeInTheDocument();
      });

      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
      });

      const shareButton = screen.getByRole("button", { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });

    test("share copies correct format with header, grid, and score", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /view results/i })).toBeInTheDocument();
      });

      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
      });

      const shareButton = screen.getByRole("button", { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        const copiedText = (navigator.clipboard.writeText as jest.Mock).mock.calls[0][0];
        expect(copiedText).toContain("Daily Athlete Unknown Baseball #");
        expect(copiedText).toContain("Score: 100");
        // Should contain emoji squares
        expect(copiedText).toMatch(/[🟨🟦]/);
      });
    });

    test("share uses blue squares for unflipped, yellow for flipped", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("Bio")).toBeInTheDocument();
      });

      // Flip one tile
      const bioTile = screen.getByText("Bio").closest(".tile");
      fireEvent.click(bioTile!);

      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 1/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /view results/i })).toBeInTheDocument();
      });

      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
      });

      const shareButton = screen.getByRole("button", { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        const copiedText = (navigator.clipboard.writeText as jest.Mock).mock.calls[0][0];
        // Should have both yellow (flipped) and blue (unflipped)
        expect(copiedText).toContain("🟨");
        expect(copiedText).toContain("🟦");
      });
    });

    test("share shows copied confirmation message", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /view results/i })).toBeInTheDocument();
      });

      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
      });

      const shareButton = screen.getByRole("button", { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText(/has been copied/i)).toBeInTheDocument();
      });
    });

    test("copied confirmation shows the actual copied text", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /view results/i })).toBeInTheDocument();
      });

      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
      });

      const shareButton = screen.getByRole("button", { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        const copiedMessage = document.querySelector(".copied-message");
        expect(copiedMessage).toBeInTheDocument();
        expect(copiedMessage!.textContent).toContain("Daily Athlete Unknown Baseball #");
        expect(copiedMessage!.textContent).toContain("Score:");
      });
    });

    test("copied confirmation disappears after 3 seconds", async () => {
      jest.useFakeTimers();

      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /view results/i })).toBeInTheDocument();
      });

      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
      });

      const shareButton = screen.getByRole("button", { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(screen.getByText(/has been copied/i)).toBeInTheDocument();
      });

      // Fast-forward time by 3 seconds
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText(/has been copied/i)).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe("Post-Win Game State", () => {
    test("tiles can still be flipped after winning", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Win the game
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });

      // Try to flip a tile
      const bioTile = screen.getByText("Bio").closest(".tile");
      fireEvent.click(bioTile!);

      await waitFor(() => {
        expect(
          screen.getByText("Greatest baseball player")
        ).toBeInTheDocument();
      });
    });

    test("score does not change after winning when flipping tiles", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Win the game
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });

      // Verify score is 100
      const scoreBox = document.querySelector(".score-box");
      expect(scoreBox).toHaveTextContent("100");

      // Flip a tile after winning
      const bioTile = screen.getByText("Bio").closest(".tile");
      fireEvent.click(bioTile!);

      await waitFor(() => {
        expect(
          screen.getByText("Greatest baseball player")
        ).toBeInTheDocument();
      });

      // Score should still be 100
      expect(scoreBox).toHaveTextContent("100");
    });

    test("tiles flipped counter does not change after winning", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Win the game
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });

      // Verify counter is 0
      expect(screen.getByText(/tiles flipped: 0/i)).toBeInTheDocument();

      // Flip a tile after winning
      const bioTile = screen.getByText("Bio").closest(".tile");
      fireEvent.click(bioTile!);

      await waitFor(() => {
        expect(
          screen.getByText("Greatest baseball player")
        ).toBeInTheDocument();
      });

      // Counter should still be 0
      expect(screen.getByText(/tiles flipped: 0/i)).toBeInTheDocument();
    });

    test("input and submit button remain enabled after winning", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Win the game
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });

      // Input and button should not be disabled
      expect(input).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });

    test("only correct answer reopens modal after winning", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Win the game
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });

      // View Results button should be visible
      expect(screen.getByRole("button", { name: /view results/i })).toBeInTheDocument();

      // Try wrong answer
      fireEvent.change(input, { target: { value: "Wrong Name" } });
      fireEvent.click(submitButton);

      // No change in UI (still shows "You guessed it right!")
      expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();

      // Try correct answer again
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      // Click View Results to open modal
      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      // Modal should be open now
      await waitFor(() => {
        const modal = screen.getByRole("button", { name: /✕/i }).closest(".results-modal-content");
        expect(modal).toBeInTheDocument();
      });
    });

    test("wrong answers do not show messages after winning", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Win the game
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });

      // Try wrong answer
      fireEvent.change(input, { target: { value: "Wrong Name" } });
      fireEvent.click(submitButton);

      // Should not show error message
      await waitFor(() => {
        expect(screen.queryByText(/wrong guess/i)).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    test("photo tile can still be toggled after winning", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Win the game
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });

      // Click photo tile
      const photoTile = screen.getByText("Photo").closest(".tile");
      fireEvent.click(photoTile!);

      await waitFor(() => {
        const photoRevealTiles = document.querySelectorAll(".photo-reveal");
        expect(photoRevealTiles.length).toBeGreaterThan(0);
      });

      // Score should still be 100 (not decreased by 6)
      const scoreBox = document.querySelector(".score-box");
      expect(scoreBox).toHaveTextContent("100");
    });
  });

  describe("Edge Cases", () => {
    test("handles empty player name submission", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Button should be disabled when input is empty
      expect(submitButton).toBeDisabled();

      // Clicking disabled button should not trigger any action
      fireEvent.click(submitButton);

      // No message should appear
      expect(screen.queryByText(/wrong guess/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/you guessed it right/i)).not.toBeInTheDocument();
    });

    test("button is enabled when player name is entered", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Initially disabled
      expect(submitButton).toBeDisabled();

      // Type something
      fireEvent.change(input, { target: { value: "Test Name" } });

      // Should be enabled
      expect(submitButton).not.toBeDisabled();

      // Clear the input
      fireEvent.change(input, { target: { value: "" } });

      // Should be disabled again
      expect(submitButton).toBeDisabled();
    });

    test("whitespace-only input keeps button disabled", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      // Type only spaces
      fireEvent.change(input, { target: { value: "   " } });

      // Button should still be disabled
      expect(submitButton).toBeDisabled();
    });

    test("handles fetch errors gracefully", async () => {
      // Suppress console.error for this test since we expect an error
      const originalError = console.error;
      console.error = jest.fn();

      // Override the default mock to simulate a network error
      (global.fetch as jest.Mock).mockClear();
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      render(<Uncover />);

      // Component should handle error without crashing
      expect(screen.getByText(/loading player data/i)).toBeInTheDocument();

      // Wait for console.error to be called (error handling occurred)
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          "Error loading player data:",
          expect.any(Error)
        );
      });

      // Restore console.error
      console.error = originalError;
    });

    test("handles missing localStorage data", async () => {
      localStorageMock.getItem.mockReturnValue(null);

      render(<Uncover />);

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "playerIndex_baseball",
          "1"
        );
      });
    });

    test("handles cycling to next player correctly", async () => {
      // Set to last index
      localStorageMock.getItem.mockReturnValueOnce(
        (mockBaseballData.length - 1).toString()
      );

      render(<Uncover />);

      await waitFor(() => {
        // Should cycle back to 0
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "playerIndex_baseball",
          "0"
        );
      });
    });
  });

  describe("Puzzle Info Section", () => {
    test("renders puzzle info section with all elements", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("Puzzle #001")).toBeInTheDocument(); // puzzle number
        expect(screen.getByText("11-19-25")).toBeInTheDocument(); // playDate in MM-DD-YY format
        expect(screen.getByText("Today's Stats")).toBeInTheDocument();
        expect(screen.getByText("Rules")).toBeInTheDocument();
      });
    });

    test("puzzle number has correct styling", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASEBALL")).toBeInTheDocument();
      });

      const puzzleNumber = screen.getByText("Puzzle #001");
      expect(puzzleNumber).toHaveClass("puzzle-number");
    });

    test("separators are present", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASEBALL")).toBeInTheDocument();
      });

      const separators = document.querySelectorAll(".separator");
      expect(separators.length).toBeGreaterThan(0);
    });

    test("Today's Stats button is clickable", async () => {
      render(<Uncover />);

      await waitFor(() => {
        const todayStatsButton = screen.getByText("Today's Stats");
        expect(todayStatsButton).toBeInTheDocument();
        fireEvent.click(todayStatsButton);
      });
    });

    test("Rules button is enabled and clickable", async () => {
      render(<Uncover />);

      await waitFor(() => {
        const rulesButton = screen.getByText("Rules");
        expect(rulesButton).not.toBeDisabled();
        expect(rulesButton).toHaveClass("rules-link");
      });
    });
  });

  describe("Rules Modal Integration", () => {
    test("does not show Rules modal by default", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASEBALL")).toBeInTheDocument();
      });

      expect(screen.queryByText("How to Play — Athlete Unknown")).not.toBeInTheDocument();
    });

    test("opens Rules modal when Rules button is clicked", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASEBALL")).toBeInTheDocument();
      });

      const rulesButton = screen.getByText("Rules");
      fireEvent.click(rulesButton);

      await waitFor(() => {
        expect(screen.getByText("How to Play — Athlete Unknown")).toBeInTheDocument();
      });
    });

    test("Rules modal displays game rules", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASEBALL")).toBeInTheDocument();
      });

      const rulesButton = screen.getByText("Rules");
      fireEvent.click(rulesButton);

      await waitFor(() => {
        expect(screen.getByText("How to Play — Athlete Unknown")).toBeInTheDocument();
        expect(screen.getByText(/Guess the mystery athlete/i)).toBeInTheDocument();
        expect(screen.getByText(/100 points/i)).toBeInTheDocument();
        expect(screen.getByText("Scoring")).toBeInTheDocument();
      });
    });

    test("closes Rules modal when close button is clicked", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASEBALL")).toBeInTheDocument();
      });

      const rulesButton = screen.getByText("Rules");
      fireEvent.click(rulesButton);

      await waitFor(() => {
        expect(screen.getByText("How to Play — Athlete Unknown")).toBeInTheDocument();
      });

      const closeButton = document.querySelector(".close-rules-button");
      expect(closeButton).toBeInTheDocument();

      if (closeButton) {
        fireEvent.click(closeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText("How to Play — Athlete Unknown")).not.toBeInTheDocument();
      });
    });

    test("closes Rules modal when clicking outside", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASEBALL")).toBeInTheDocument();
      });

      const rulesButton = screen.getByText("Rules");
      fireEvent.click(rulesButton);

      await waitFor(() => {
        expect(screen.getByText("How to Play — Athlete Unknown")).toBeInTheDocument();
      });

      const overlay = document.querySelector(".rules-modal-overlay");
      expect(overlay).toBeInTheDocument();

      if (overlay) {
        fireEvent.click(overlay);
      }

      await waitFor(() => {
        expect(screen.queryByText("How to Play — Athlete Unknown")).not.toBeInTheDocument();
      });
    });

    test("game remains functional after Rules modal", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASEBALL")).toBeInTheDocument();
      });

      // Open Rules modal
      const rulesButton = screen.getByText("Rules");
      fireEvent.click(rulesButton);

      await waitFor(() => {
        expect(screen.getByText("How to Play — Athlete Unknown")).toBeInTheDocument();
      });

      // Close modal
      const closeButton = document.querySelector(".close-rules-button");
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText("How to Play — Athlete Unknown")).not.toBeInTheDocument();
      });

      // Rules button should still be there
      expect(screen.getByText("Rules")).toBeInTheDocument();

      // Game should still be functional
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter player name/i)).toBeInTheDocument();
      });
    });

    test("modal content does not close when clicking inside it", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASEBALL")).toBeInTheDocument();
      });

      const rulesButton = screen.getByText("Rules");
      fireEvent.click(rulesButton);

      await waitFor(() => {
        expect(screen.getByText("How to Play — Athlete Unknown")).toBeInTheDocument();
      });

      const modalContent = document.querySelector(".rules-modal-content");
      expect(modalContent).toBeInTheDocument();

      if (modalContent) {
        fireEvent.click(modalContent);
      }

      // Modal should still be open
      expect(screen.getByText("How to Play — Athlete Unknown")).toBeInTheDocument();
    });

    test("Rules modal displays all sport sections", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASEBALL")).toBeInTheDocument();
      });

      const rulesButton = screen.getByText("Rules");
      fireEvent.click(rulesButton);

      await waitFor(() => {
        expect(screen.getByText("How to Play — Athlete Unknown")).toBeInTheDocument();

        // Check for baseball stats
        expect(screen.getByText("BA")).toBeInTheDocument();
        expect(screen.getByText("HR")).toBeInTheDocument();

        // Check for basketball stats
        expect(screen.getByText("PTS")).toBeInTheDocument();
        expect(screen.getByText("REB")).toBeInTheDocument();

        // Check for football stats
        expect(screen.getByText("Quarterback")).toBeInTheDocument();
        expect(screen.getByText("Running Back")).toBeInTheDocument();
      });
    });

    test("can open Rules modal multiple times", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASEBALL")).toBeInTheDocument();
      });

      const rulesButton = screen.getByText("Rules");

      // Open first time
      fireEvent.click(rulesButton);
      await waitFor(() => {
        expect(screen.getByText("How to Play — Athlete Unknown")).toBeInTheDocument();
      });

      // Close
      const closeButton1 = document.querySelector(".close-rules-button");
      if (closeButton1) {
        fireEvent.click(closeButton1);
      }

      await waitFor(() => {
        expect(screen.queryByText("How to Play — Athlete Unknown")).not.toBeInTheDocument();
      });

      // Open second time
      fireEvent.click(rulesButton);
      await waitFor(() => {
        expect(screen.getByText("How to Play — Athlete Unknown")).toBeInTheDocument();
      });
    });
  });

  describe("Today's Stats Modal", () => {
    test("opens Today's Stats modal when button is clicked", async () => {
      render(<Uncover />);

      // Wait for data to load first
      await waitFor(() => {
        expect(screen.getByText("Bio")).toBeInTheDocument();
      });

      const todayStatsButton = screen.getByText("Today's Stats");
      fireEvent.click(todayStatsButton);

      await waitFor(() => {
        // Should show mock round stats with mystery player name since puzzle isn't solved
        expect(screen.getByText("Today's Baseball Stats")).toBeInTheDocument();
        expect(screen.getByText("???")).toBeInTheDocument(); // Mystery player before solving
        expect(screen.getByText("(Solve the puzzle to reveal)")).toBeInTheDocument();
      });
    });

    test("shows round stats with correct sport data", async () => {
      render(<Uncover />);

      await waitFor(() => {
        const todayStatsButton = screen.getByText("Today's Stats");
        fireEvent.click(todayStatsButton);
      });

      await waitFor(() => {
        // Should show baseball stats by default
        expect(screen.getByText("Today's Baseball Stats")).toBeInTheDocument();

        const modal = screen.getByText("Today's Baseball Stats").closest(".today-stats-modal-content");
        expect(modal).toHaveTextContent("100"); // totalPlays
        expect(modal).toHaveTextContent("55"); // averageScore
        expect(modal).toHaveTextContent("75%"); // percentageCorrect
      });
    });
  });

  describe("Round Stats in Results Modal", () => {
    test("results modal includes round stats section", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });

      // Click View Results to open modal
      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        expect(screen.getByText("Today's Round Stats")).toBeInTheDocument();
      });
    });

    test("round stats display correct values", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });

      // Click View Results to open modal
      const viewResultsButton = screen.getByRole("button", { name: /view results/i });
      fireEvent.click(viewResultsButton);

      await waitFor(() => {
        const resultsModal = screen
          .getByText(/correct! your score is/i)
          .closest(".results-modal-content");

        // Check for mock round stats values (baseball)
        expect(resultsModal).toHaveTextContent("100"); // totalPlays
        expect(resultsModal).toHaveTextContent("55"); // averageScore
        expect(resultsModal).toHaveTextContent("75%"); // percentageCorrect
      });
    });
  });

  describe("Mystery Player Hiding", () => {
    test("hides mystery player name before puzzle is solved", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("Today's Stats")).toBeInTheDocument();
      });

      // Open Today's Stats modal
      const todayStatsButton = screen.getByText("Today's Stats");
      fireEvent.click(todayStatsButton);

      await waitFor(() => {
        // Should show "???" instead of player name
        expect(screen.getByText("???")).toBeInTheDocument();
        expect(screen.getByText(/solve the puzzle to reveal/i)).toBeInTheDocument();
        // Should NOT show the actual player name
        expect(screen.queryByText("Babe Ruth")).not.toBeInTheDocument();
      });
    });

    test("reveals mystery player name after puzzle is solved", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      // Solve the puzzle
      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });

      // Open Today's Stats modal
      const todayStatsButton = screen.getByText("Today's Stats");
      fireEvent.click(todayStatsButton);

      await waitFor(() => {
        // Should show actual player name now
        expect(screen.getByText("Babe Ruth")).toBeInTheDocument();
        // Should NOT show the mystery placeholder
        expect(screen.queryByText("???")).not.toBeInTheDocument();
        expect(screen.queryByText(/solve the puzzle to reveal/i)).not.toBeInTheDocument();
      });
    });

    test("hides mystery player when switching to unsolved sport", async () => {
      const mockBasketballData: RoundData[] = [
        createMockRoundData(
          "Michael Jordan",
          "GOAT",
          "Guard",
          "1984 Draft",
          "1984-2003",
          "Bulls, Wizards",
          "23",
          "30.1 PPG",
          "6 Championships",
          "/mj.jpg",
          "basketball",
          1
        ),
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => mockBaseballData })
        .mockResolvedValueOnce({ json: async () => mockBasketballData });

      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      // Solve baseball puzzle
      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });

      // Switch to basketball (unsolved)
      fireEvent.click(screen.getByText("BASKETBALL"));

      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 0/i)).toBeInTheDocument();
      });

      // Open Today's Stats modal for basketball
      const todayStatsButton = screen.getByText("Today's Stats");
      fireEvent.click(todayStatsButton);

      await waitFor(() => {
        // Should show "???" for basketball (unsolved)
        expect(screen.getByText("???")).toBeInTheDocument();
        expect(screen.getByText(/solve the puzzle to reveal/i)).toBeInTheDocument();
        // Should NOT show Michael Jordan's name
        expect(screen.queryByText("Michael Jordan")).not.toBeInTheDocument();
      });
    });

    test("maintains revealed player name when switching back to solved sport", async () => {
      const mockBasketballData: RoundData[] = [
        createMockRoundData(
          "LeBron James",
          "King",
          "Forward",
          "2003 Draft",
          "2003-Present",
          "Cavaliers, Heat, Lakers",
          "23, 6",
          "27.2 PPG",
          "4 Championships",
          "/lbj.jpg",
          "basketball",
          1
        ),
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => mockBaseballData })
        .mockResolvedValueOnce({ json: async () => mockBasketballData });

      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      // Solve baseball puzzle
      const input = screen.getByPlaceholderText(/enter player name/i);
      const submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });

      // Switch to basketball
      fireEvent.click(screen.getByText("BASKETBALL"));

      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 0/i)).toBeInTheDocument();
      });

      // Switch back to baseball
      fireEvent.click(screen.getByText("BASEBALL"));

      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 0/i)).toBeInTheDocument();
      });

      // Open Today's Stats modal for baseball (solved)
      const todayStatsButton = screen.getByText("Today's Stats");
      fireEvent.click(todayStatsButton);

      await waitFor(() => {
        // Should still show Babe Ruth's name (solved puzzle)
        expect(screen.getByText("Babe Ruth")).toBeInTheDocument();
        // Should NOT show mystery placeholder
        expect(screen.queryByText("???")).not.toBeInTheDocument();
        expect(screen.queryByText(/solve the puzzle to reveal/i)).not.toBeInTheDocument();
      });
    });

    test("each sport independently tracks mystery player reveal status", async () => {
      const mockBasketballData: RoundData[] = [
        createMockRoundData(
          "Kobe Bryant",
          "Mamba",
          "Guard",
          "1996 Draft",
          "1996-2016",
          "Lakers",
          "8, 24",
          "25 PPG",
          "5 Championships",
          "/kobe.jpg",
          "basketball",
          1
        ),
      ];

      const mockFootballData: RoundData[] = [
        createMockRoundData(
          "Tom Brady",
          "QB GOAT",
          "Quarterback",
          "2000 Draft",
          "2000-2022",
          "Patriots, Buccaneers",
          "12",
          "89,214 yards",
          "7 Super Bowls",
          "/tb.jpg",
          "football",
          1
        ),
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ json: async () => mockBaseballData })
        .mockResolvedValueOnce({ json: async () => mockBasketballData })
        .mockResolvedValueOnce({ json: async () => mockFootballData });

      render(<Uncover />);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/enter player name/i)
        ).toBeInTheDocument();
      });

      // Solve baseball puzzle
      let input = screen.getByPlaceholderText(/enter player name/i);
      let submitButton = screen.getByRole("button", { name: /submit/i });
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });

      // Switch to basketball and solve
      fireEvent.click(screen.getByText("BASKETBALL"));

      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 0/i)).toBeInTheDocument();
      });

      // Wait for basketball data to actually load by checking for basketball-specific content
      await waitFor(() => {
        // Wait for the basketball player's bio to appear in the tile
        const tiles = screen.getAllByText("Bio");
        const bioTile = tiles[0].closest(".tile");
        const tileBack = bioTile?.querySelector(".tile-back");
        expect(tileBack).toHaveTextContent("Mamba");
      });

      // Query for fresh elements after sport switch
      input = screen.getByPlaceholderText(/enter player name/i);
      submitButton = screen.getByRole("button", { name: /submit/i });

      fireEvent.change(input, { target: { value: "Kobe Bryant" } });

      // Wait for the submit button to be enabled before clicking
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/you guessed it right!/i)).toBeInTheDocument();
      });

      // Switch to football (unsolved)
      fireEvent.click(screen.getByText("FOOTBALL"));

      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 0/i)).toBeInTheDocument();
      });

      // Open Today's Stats for football
      let todayStatsButton = screen.getByText("Today's Stats");
      fireEvent.click(todayStatsButton);

      await waitFor(() => {
        // Football should show ???
        expect(screen.getByText("???")).toBeInTheDocument();
        expect(screen.queryByText("Tom Brady")).not.toBeInTheDocument();
      });

      // Close modal
      let closeButton = screen.getByRole("button", { name: /×/i });
      fireEvent.click(closeButton);

      // Switch back to baseball
      fireEvent.click(screen.getByText("BASEBALL"));

      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 0/i)).toBeInTheDocument();
      });

      // Open Today's Stats for baseball
      todayStatsButton = screen.getByText("Today's Stats");
      fireEvent.click(todayStatsButton);

      await waitFor(() => {
        // Baseball should still show Babe Ruth
        expect(screen.getByText("Babe Ruth")).toBeInTheDocument();
        expect(screen.queryByText("???")).not.toBeInTheDocument();
      });
    });
  });
});
