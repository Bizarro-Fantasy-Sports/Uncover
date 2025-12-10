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

interface RoundStats {
  playDate: string;
  sport: string;
  name?: string;
  totalPlays: number;
  percentageCorrect: number;
  averageScore: number;
  averageCorrectScore: number;
  highestScore: number;
  mostCommonFirstTileFlipped: string;
  mostCommonLastTileFlipped: string;
  tileFlipCounts: {
    bio: number;
    careerStats: number;
    draftInformation: number;
    jerseyNumbers: number;
    personalAchievements: number;
    photo: number;
    playerInformation: number;
    teamsPlayedOn: number;
    yearsActive: number;
  };
}

// Sample test data
const mockBaseballPlayerData: PlayerData = {
  Name: "Babe Ruth",
  Bio: "Greatest baseball player",
  "Player Information": "Outfielder/Pitcher",
  "Draft Information": "Signed 1914",
  "Years Active": "1914-1935",
  "Teams Played On": "Red Sox, Yankees, Braves",
  "Jersey Numbers": "3",
  "Career Stats": "714 HR, .342 AVG",
  "Personal Achievements": "7 World Series, 2 MVP",
  Photo: ["/images/babe-ruth.jpg"],
};

const mockBaseballRoundStats: RoundStats = {
  playDate: "2025-01-01",
  sport: "baseball",
  name: "Babe Ruth",
  totalPlays: 100,
  percentageCorrect: 75,
  averageScore: 85,
  averageCorrectScore: 90,
  highestScore: 100,
  mostCommonFirstTileFlipped: "Bio",
  mostCommonLastTileFlipped: "Photo",
  tileFlipCounts: {
    bio: 50,
    careerStats: 40,
    draftInformation: 30,
    jerseyNumbers: 20,
    personalAchievements: 25,
    photo: 80,
    playerInformation: 35,
    teamsPlayedOn: 45,
    yearsActive: 38,
  },
};

// Legacy array format for backwards compatibility with some tests
const mockBaseballData: PlayerData[] = [mockBaseballPlayerData];

describe("Uncover Component", () => {
  beforeEach(() => {
    // Clear call history but preserve mock implementations
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();

    // Reset localStorage store
    localStorageMock.clear();

    // Setup default fetch mock - mock the new /v1/round endpoint
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        roundId: "baseball001",
        sport: "baseball",
        playDate: "2025-01-01",
        player: {
          name: mockBaseballPlayerData.Name,
          bio: mockBaseballPlayerData.Bio,
          playerInformation: mockBaseballPlayerData["Player Information"],
          draftInformation: mockBaseballPlayerData["Draft Information"],
          yearsActive: mockBaseballPlayerData["Years Active"],
          teamsPlayedOn: mockBaseballPlayerData["Teams Played On"],
          jerseyNumbers: mockBaseballPlayerData["Jersey Numbers"],
          careerStats: mockBaseballPlayerData["Career Stats"],
          personalAchievements: mockBaseballPlayerData["Personal Achievements"],
          photo: mockBaseballPlayerData.Photo[0],
        },
        stats: mockBaseballRoundStats,
      }),
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
        // Should make API call to /v1/round endpoint
        expect(global.fetch).toHaveBeenCalled();
        const calls = (global.fetch as jest.Mock).mock.calls;
        expect(calls.length).toBeGreaterThanOrEqual(1);
        expect(calls[0][0]).toContain('/v1/round');
        expect(calls[0][0]).toContain('sport=baseball');
      });
    });

    test("loads player data from API", async () => {
      render(<Uncover />);

      // Wait for component to load player data
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter player name/i)).toBeInTheDocument();
      });
    });

    test("loads basketball data when basketball tab is clicked", async () => {
      const mockBasketballPlayerData: PlayerData = {
        Name: "Michael Jordan",
        Bio: "GOAT",
        "Player Information": "Guard",
        "Draft Information": "1984 Draft",
        "Years Active": "1984-2003",
        "Teams Played On": "Bulls, Wizards",
        "Jersey Numbers": "23",
        "Career Stats": "30.1 PPG",
        "Personal Achievements": "6 Championships",
        Photo: ["/mj.jpg"],
      };

      const mockBasketballRoundStats: RoundStats = {
        playDate: "2025-01-01",
        sport: "basketball",
        name: "Michael Jordan",
        totalPlays: 100,
        percentageCorrect: 80,
        averageScore: 90,
        averageCorrectScore: 95,
        highestScore: 100,
        mostCommonFirstTileFlipped: "Bio",
        mostCommonLastTileFlipped: "Photo",
        tileFlipCounts: {
          bio: 50,
          careerStats: 40,
          draftInformation: 30,
          jerseyNumbers: 20,
          personalAchievements: 25,
          photo: 80,
          playerInformation: 35,
          teamsPlayedOn: 45,
          yearsActive: 38,
        },
      };

      // Mock baseball round first, then basketball round
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            roundId: "baseball001",
            sport: "baseball",
            playDate: "2025-01-01",
            player: {
              name: mockBaseballPlayerData.Name,
              bio: mockBaseballPlayerData.Bio,
              playerInformation: mockBaseballPlayerData["Player Information"],
              draftInformation: mockBaseballPlayerData["Draft Information"],
              yearsActive: mockBaseballPlayerData["Years Active"],
              teamsPlayedOn: mockBaseballPlayerData["Teams Played On"],
              jerseyNumbers: mockBaseballPlayerData["Jersey Numbers"],
              careerStats: mockBaseballPlayerData["Career Stats"],
              personalAchievements: mockBaseballPlayerData["Personal Achievements"],
              photo: mockBaseballPlayerData.Photo[0],
            },
            stats: mockBaseballRoundStats,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            roundId: "basketball001",
            sport: "basketball",
            playDate: "2025-01-01",
            player: {
              name: mockBasketballPlayerData.Name,
              bio: mockBasketballPlayerData.Bio,
              playerInformation: mockBasketballPlayerData["Player Information"],
              draftInformation: mockBasketballPlayerData["Draft Information"],
              yearsActive: mockBasketballPlayerData["Years Active"],
              teamsPlayedOn: mockBasketballPlayerData["Teams Played On"],
              jerseyNumbers: mockBasketballPlayerData["Jersey Numbers"],
              careerStats: mockBasketballPlayerData["Career Stats"],
              personalAchievements: mockBasketballPlayerData["Personal Achievements"],
              photo: mockBasketballPlayerData.Photo[0],
            },
            stats: mockBasketballRoundStats,
          }),
        });

      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASKETBALL")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("BASKETBALL"));

      await waitFor(() => {
        // Verify fetch was called with basketball /v1/round endpoint
        const calls = (global.fetch as jest.Mock).mock.calls;
        const basketballCalls = calls.filter(call =>
          call[0].includes('/v1/round') && call[0].includes('sport=basketball')
        );
        expect(basketballCalls.length).toBeGreaterThanOrEqual(1);
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
      const mockFootballPlayerData: PlayerData = {
        Name: "Tom Brady",
        Bio: "QB GOAT",
        "Player Information": "Quarterback",
        "Draft Information": "2000 Draft",
        "Years Active": "2000-2022",
        "Teams Played On": "Patriots, Buccaneers",
        "Jersey Numbers": "12",
        "Career Stats": "89,214 yards",
        "Personal Achievements": "7 Super Bowls",
        Photo: ["/tb.jpg"],
      };

      const mockFootballRoundStats: RoundStats = {
        playDate: "2025-01-01",
        sport: "football",
        name: "Tom Brady",
        totalPlays: 50,
        percentageCorrect: 65,
        averageScore: 75,
        averageCorrectScore: 80,
        highestScore: 95,
        mostCommonFirstTileFlipped: "Bio",
        mostCommonLastTileFlipped: "Photo",
        tileFlipCounts: {
          bio: 20,
          careerStats: 15,
          draftInformation: 12,
          jerseyNumbers: 8,
          personalAchievements: 10,
          photo: 35,
          playerInformation: 14,
          teamsPlayedOn: 18,
          yearsActive: 16,
        },
      };

      // Mock baseball round first, then football round
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            roundId: "baseball001",
            sport: "baseball",
            playDate: "2025-01-01",
            player: {
              name: mockBaseballPlayerData.Name,
              bio: mockBaseballPlayerData.Bio,
              playerInformation: mockBaseballPlayerData["Player Information"],
              draftInformation: mockBaseballPlayerData["Draft Information"],
              yearsActive: mockBaseballPlayerData["Years Active"],
              teamsPlayedOn: mockBaseballPlayerData["Teams Played On"],
              jerseyNumbers: mockBaseballPlayerData["Jersey Numbers"],
              careerStats: mockBaseballPlayerData["Career Stats"],
              personalAchievements: mockBaseballPlayerData["Personal Achievements"],
              photo: mockBaseballPlayerData.Photo[0],
            },
            stats: mockBaseballRoundStats,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            roundId: "football001",
            sport: "football",
            playDate: "2025-01-01",
            player: {
              name: mockFootballPlayerData.Name,
              bio: mockFootballPlayerData.Bio,
              playerInformation: mockFootballPlayerData["Player Information"],
              draftInformation: mockFootballPlayerData["Draft Information"],
              yearsActive: mockFootballPlayerData["Years Active"],
              teamsPlayedOn: mockFootballPlayerData["Teams Played On"],
              jerseyNumbers: mockFootballPlayerData["Jersey Numbers"],
              careerStats: mockFootballPlayerData["Career Stats"],
              personalAchievements: mockFootballPlayerData["Personal Achievements"],
              photo: mockFootballPlayerData.Photo[0],
            },
            stats: mockFootballRoundStats,
          }),
        });

      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("FOOTBALL")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("FOOTBALL"));

      await waitFor(() => {
        // Verify fetch was called with football /v1/round endpoint
        const calls = (global.fetch as jest.Mock).mock.calls;
        const footballCalls = calls.filter(call =>
          call[0].includes('/v1/round') && call[0].includes('sport=football')
        );
        expect(footballCalls.length).toBeGreaterThanOrEqual(1);
      });
    });

    test("each sport maintains separate game state", async () => {
      const mockBasketballPlayerData: PlayerData = {
        Name: "LeBron James",
        Bio: "King",
        "Player Information": "Forward",
        "Draft Information": "2003 Draft",
        "Years Active": "2003-Present",
        "Teams Played On": "Cavaliers, Heat, Lakers",
        "Jersey Numbers": "23, 6",
        "Career Stats": "27 PPG",
        "Personal Achievements": "4 Championships",
        Photo: ["/lbj.jpg"],
      };

      const mockBasketballRoundStats: RoundStats = {
        playDate: "2025-01-01",
        sport: "basketball",
        name: "LeBron James",
        totalPlays: 75,
        percentageCorrect: 72,
        averageScore: 83,
        averageCorrectScore: 88,
        highestScore: 96,
        mostCommonFirstTileFlipped: "Bio",
        mostCommonLastTileFlipped: "Photo",
        tileFlipCounts: {
          bio: 35,
          careerStats: 28,
          draftInformation: 22,
          jerseyNumbers: 14,
          personalAchievements: 18,
          photo: 48,
          playerInformation: 25,
          teamsPlayedOn: 32,
          yearsActive: 27,
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            roundId: "baseball001",
            sport: "baseball",
            playDate: "2025-01-01",
            player: {
              name: mockBaseballPlayerData.Name,
              bio: mockBaseballPlayerData.Bio,
              playerInformation: mockBaseballPlayerData["Player Information"],
              draftInformation: mockBaseballPlayerData["Draft Information"],
              yearsActive: mockBaseballPlayerData["Years Active"],
              teamsPlayedOn: mockBaseballPlayerData["Teams Played On"],
              jerseyNumbers: mockBaseballPlayerData["Jersey Numbers"],
              careerStats: mockBaseballPlayerData["Career Stats"],
              personalAchievements: mockBaseballPlayerData["Personal Achievements"],
              photo: mockBaseballPlayerData.Photo[0],
            },
            stats: mockBaseballRoundStats,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            roundId: "basketball001",
            sport: "basketball",
            playDate: "2025-01-01",
            player: {
              name: mockBasketballPlayerData.Name,
              bio: mockBasketballPlayerData.Bio,
              playerInformation: mockBasketballPlayerData["Player Information"],
              draftInformation: mockBasketballPlayerData["Draft Information"],
              yearsActive: mockBasketballPlayerData["Years Active"],
              teamsPlayedOn: mockBasketballPlayerData["Teams Played On"],
              jerseyNumbers: mockBasketballPlayerData["Jersey Numbers"],
              careerStats: mockBasketballPlayerData["Career Stats"],
              personalAchievements: mockBasketballPlayerData["Personal Achievements"],
              photo: mockBasketballPlayerData.Photo[0],
            },
            stats: mockBasketballRoundStats,
          }),
        });

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
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
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
        expect(screen.getByText(/the average score today is 85/i)).toBeInTheDocument();
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
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole("button", { name: /✕/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText(/correct! your score is/i)).not.toBeInTheDocument();
      });

      // Reopen modal by submitting correct answer again
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

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
        expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
      });

      const shareButton = screen.getByRole("button", { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        const copiedText = (navigator.clipboard.writeText as jest.Mock).mock.calls[0][0];
        expect(copiedText).toContain("Daily Uncover #");
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
        expect(screen.getByRole("button", { name: /share/i })).toBeInTheDocument();
      });

      const shareButton = screen.getByRole("button", { name: /share/i });
      fireEvent.click(shareButton);

      await waitFor(() => {
        const copiedMessage = document.querySelector(".copied-message");
        expect(copiedMessage).toBeInTheDocument();
        expect(copiedMessage!.textContent).toContain("Daily Uncover #");
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
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole("button", { name: /✕/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText(/correct! your score is/i)).not.toBeInTheDocument();
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
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      });

      // Verify score is 100
      const scoreBox = document.querySelector(".score-box");
      expect(scoreBox).toHaveTextContent("100");

      // Close modal
      const closeButton = screen.getByRole("button", { name: /✕/i });
      fireEvent.click(closeButton);

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
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      });

      // Verify counter is 0
      expect(screen.getByText(/tiles flipped: 0/i)).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByRole("button", { name: /✕/i });
      fireEvent.click(closeButton);

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
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole("button", { name: /✕/i });
      fireEvent.click(closeButton);

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
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole("button", { name: /✕/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText(/correct! your score is/i)).not.toBeInTheDocument();
      });

      // Try wrong answer
      fireEvent.change(input, { target: { value: "Wrong Name" } });
      fireEvent.click(submitButton);

      // Modal should not reopen
      await waitFor(() => {
        expect(screen.queryByText(/correct! your score is/i)).not.toBeInTheDocument();
      }, { timeout: 1000 });

      // Try correct answer
      fireEvent.change(input, { target: { value: "Babe Ruth" } });
      fireEvent.click(submitButton);

      // Modal should reopen
      await waitFor(() => {
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
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
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole("button", { name: /✕/i });
      fireEvent.click(closeButton);

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
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole("button", { name: /✕/i });
      fireEvent.click(closeButton);

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
      // Override the default mock to simulate a network error
      (global.fetch as jest.Mock).mockClear();
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      render(<Uncover />);

      // Component should show error UI with retry button
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test("handles missing localStorage data", async () => {
      localStorageMock.getItem.mockReturnValue(null);

      render(<Uncover />);

      await waitFor(() => {
        // Component should still load successfully
        expect(screen.getByPlaceholderText(/enter player name/i)).toBeInTheDocument();
      });
    });

    test("renders successfully with API data", async () => {
      render(<Uncover />);

      await waitFor(() => {
        // Component should load player data from API
        expect(screen.getByPlaceholderText(/enter player name/i)).toBeInTheDocument();
      });
    });
  });

  describe("Puzzle Info Section", () => {
    test("renders puzzle info section with all elements", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("Puzzle #__")).toBeInTheDocument();
        expect(screen.getByText("Today's Stats")).toBeInTheDocument();
        expect(screen.getByText("Rules")).toBeInTheDocument();
      });
    });

    test("puzzle number has correct styling", async () => {
      render(<Uncover />);

      await waitFor(() => {
        expect(screen.getByText("BASEBALL")).toBeInTheDocument();
      });

      const puzzleNumber = screen.getByText("Puzzle #__");
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
        expect(modal).toHaveTextContent("100"); // totalPlays from mockBaseballRoundStats
        expect(modal).toHaveTextContent("85"); // averageScore from mockBaseballRoundStats
        expect(modal).toHaveTextContent("75%"); // percentageCorrect from mockBaseballRoundStats
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
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
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
        const resultsModal = screen
          .getByText(/correct! your score is/i)
          .closest(".results-modal-content");

        // Check for mock round stats values (baseball) from mockBaseballRoundStats
        expect(resultsModal).toHaveTextContent("100"); // totalPlays
        expect(resultsModal).toHaveTextContent("85"); // averageScore
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
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      });

      // Close results modal
      const closeButton = screen.getByRole("button", { name: /✕/i });
      fireEvent.click(closeButton);

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
      const mockBasketballPlayerData: PlayerData = {
        Name: "Michael Jordan",
        Bio: "GOAT",
        "Player Information": "Guard",
        "Draft Information": "1984 Draft",
        "Years Active": "1984-2003",
        "Teams Played On": "Bulls, Wizards",
        "Jersey Numbers": "23",
        "Career Stats": "30.1 PPG",
        "Personal Achievements": "6 Championships",
        Photo: ["/mj.jpg"],
      };

      const mockBasketballRoundStats: RoundStats = {
        playDate: "2025-01-01",
        sport: "basketball",
        name: "Michael Jordan",
        totalPlays: 90,
        percentageCorrect: 78,
        averageScore: 88,
        averageCorrectScore: 92,
        highestScore: 99,
        mostCommonFirstTileFlipped: "Bio",
        mostCommonLastTileFlipped: "Photo",
        tileFlipCounts: {
          bio: 45,
          careerStats: 38,
          draftInformation: 28,
          jerseyNumbers: 18,
          personalAchievements: 22,
          photo: 58,
          playerInformation: 32,
          teamsPlayedOn: 42,
          yearsActive: 35,
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            roundId: "baseball001",
            sport: "baseball",
            playDate: "2025-01-01",
            player: {
              name: mockBaseballPlayerData.Name,
              bio: mockBaseballPlayerData.Bio,
              playerInformation: mockBaseballPlayerData["Player Information"],
              draftInformation: mockBaseballPlayerData["Draft Information"],
              yearsActive: mockBaseballPlayerData["Years Active"],
              teamsPlayedOn: mockBaseballPlayerData["Teams Played On"],
              jerseyNumbers: mockBaseballPlayerData["Jersey Numbers"],
              careerStats: mockBaseballPlayerData["Career Stats"],
              personalAchievements: mockBaseballPlayerData["Personal Achievements"],
              photo: mockBaseballPlayerData.Photo[0],
            },
            stats: mockBaseballRoundStats,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            roundId: "basketball001",
            sport: "basketball",
            playDate: "2025-01-01",
            player: {
              name: mockBasketballPlayerData.Name,
              bio: mockBasketballPlayerData.Bio,
              playerInformation: mockBasketballPlayerData["Player Information"],
              draftInformation: mockBasketballPlayerData["Draft Information"],
              yearsActive: mockBasketballPlayerData["Years Active"],
              teamsPlayedOn: mockBasketballPlayerData["Teams Played On"],
              jerseyNumbers: mockBasketballPlayerData["Jersey Numbers"],
              careerStats: mockBasketballPlayerData["Career Stats"],
              personalAchievements: mockBasketballPlayerData["Personal Achievements"],
              photo: mockBasketballPlayerData.Photo[0],
            },
            stats: mockBasketballRoundStats,
          }),
        });

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
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      });

      // Close results modal
      const closeButton = screen.getByRole("button", { name: /✕/i });
      fireEvent.click(closeButton);

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
      const mockBasketballPlayerData: PlayerData = {
        Name: "LeBron James",
        Bio: "King",
        "Player Information": "Forward",
        "Draft Information": "2003 Draft",
        "Years Active": "2003-Present",
        "Teams Played On": "Cavaliers, Heat, Lakers",
        "Jersey Numbers": "23, 6",
        "Career Stats": "27.2 PPG",
        "Personal Achievements": "4 Championships",
        Photo: ["/lbj.jpg"],
      };

      const mockBasketballRoundStats: RoundStats = {
        playDate: "2025-01-01",
        sport: "basketball",
        name: "LeBron James",
        totalPlays: 50,
        percentageCorrect: 70,
        averageScore: 80,
        averageCorrectScore: 85,
        highestScore: 95,
        mostCommonFirstTileFlipped: "Bio",
        mostCommonLastTileFlipped: "Photo",
        tileFlipCounts: {
          bio: 25,
          careerStats: 20,
          draftInformation: 15,
          jerseyNumbers: 10,
          personalAchievements: 12,
          photo: 40,
          playerInformation: 18,
          teamsPlayedOn: 22,
          yearsActive: 19,
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            roundId: "baseball001",
            sport: "baseball",
            playDate: "2025-01-01",
            player: {
              name: mockBaseballPlayerData.Name,
              bio: mockBaseballPlayerData.Bio,
              playerInformation: mockBaseballPlayerData["Player Information"],
              draftInformation: mockBaseballPlayerData["Draft Information"],
              yearsActive: mockBaseballPlayerData["Years Active"],
              teamsPlayedOn: mockBaseballPlayerData["Teams Played On"],
              jerseyNumbers: mockBaseballPlayerData["Jersey Numbers"],
              careerStats: mockBaseballPlayerData["Career Stats"],
              personalAchievements: mockBaseballPlayerData["Personal Achievements"],
              photo: mockBaseballPlayerData.Photo[0],
            },
            stats: mockBaseballRoundStats,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            roundId: "basketball001",
            sport: "basketball",
            playDate: "2025-01-01",
            player: {
              name: mockBasketballPlayerData.Name,
              bio: mockBasketballPlayerData.Bio,
              playerInformation: mockBasketballPlayerData["Player Information"],
              draftInformation: mockBasketballPlayerData["Draft Information"],
              yearsActive: mockBasketballPlayerData["Years Active"],
              teamsPlayedOn: mockBasketballPlayerData["Teams Played On"],
              jerseyNumbers: mockBasketballPlayerData["Jersey Numbers"],
              careerStats: mockBasketballPlayerData["Career Stats"],
              personalAchievements: mockBasketballPlayerData["Personal Achievements"],
              photo: mockBasketballPlayerData.Photo[0],
            },
            stats: mockBasketballRoundStats,
          }),
        });

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
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      });

      // Close results modal
      let closeButton = screen.getByRole("button", { name: /✕/i });
      fireEvent.click(closeButton);

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

    test.skip("each sport independently tracks mystery player reveal status", async () => {
      const mockBasketballPlayerData: PlayerData = {
        Name: "Kobe Bryant",
        Bio: "Mamba",
        "Player Information": "Guard",
        "Draft Information": "1996 Draft",
        "Years Active": "1996-2016",
        "Teams Played On": "Lakers",
        "Jersey Numbers": "8, 24",
        "Career Stats": "25 PPG",
        "Personal Achievements": "5 Championships",
        Photo: ["/kobe.jpg"],
      };

      const mockBasketballRoundStats: RoundStats = {
        playDate: "2025-01-01",
        sport: "basketball",
        name: "Kobe Bryant",
        totalPlays: 60,
        percentageCorrect: 68,
        averageScore: 78,
        averageCorrectScore: 82,
        highestScore: 92,
        mostCommonFirstTileFlipped: "Bio",
        mostCommonLastTileFlipped: "Photo",
        tileFlipCounts: {
          bio: 30,
          careerStats: 25,
          draftInformation: 18,
          jerseyNumbers: 12,
          personalAchievements: 15,
          photo: 45,
          playerInformation: 20,
          teamsPlayedOn: 28,
          yearsActive: 22,
        },
      };

      const mockFootballPlayerData: PlayerData = {
        Name: "Tom Brady",
        Bio: "QB GOAT",
        "Player Information": "Quarterback",
        "Draft Information": "2000 Draft",
        "Years Active": "2000-2022",
        "Teams Played On": "Patriots, Buccaneers",
        "Jersey Numbers": "12",
        "Career Stats": "89,214 yards",
        "Personal Achievements": "7 Super Bowls",
        Photo: ["/tb.jpg"],
      };

      const mockFootballRoundStats: RoundStats = {
        playDate: "2025-01-01",
        sport: "football",
        name: "Tom Brady",
        totalPlays: 80,
        percentageCorrect: 72,
        averageScore: 82,
        averageCorrectScore: 87,
        highestScore: 98,
        mostCommonFirstTileFlipped: "Bio",
        mostCommonLastTileFlipped: "Photo",
        tileFlipCounts: {
          bio: 40,
          careerStats: 35,
          draftInformation: 25,
          jerseyNumbers: 15,
          personalAchievements: 20,
          photo: 55,
          playerInformation: 28,
          teamsPlayedOn: 38,
          yearsActive: 30,
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => mockBaseballPlayerData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockBaseballRoundStats })
        .mockResolvedValueOnce({ ok: true, json: async () => mockBasketballPlayerData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockBasketballRoundStats })
        .mockResolvedValueOnce({ ok: true, json: async () => mockFootballPlayerData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockFootballRoundStats });

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
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      });

      // Close results modal
      let closeButton = screen.getByRole("button", { name: /✕/i });
      fireEvent.click(closeButton);

      // Switch to basketball and solve
      fireEvent.click(screen.getByText("BASKETBALL"));

      await waitFor(() => {
        expect(screen.getByText(/tiles flipped: 0/i)).toBeInTheDocument();
        // Verify the input field is available, indicating data is loaded
        expect(screen.getByPlaceholderText(/enter player name/i)).toBeInTheDocument();
      });

      // Query for fresh elements after sport switch
      input = screen.getByPlaceholderText(/enter player name/i);

      fireEvent.change(input, { target: { value: "Kobe Bryant" } });

      // Wait for the submit button to be enabled before clicking
      await waitFor(() => {
        submitButton = screen.getByRole("button", { name: /submit/i });
        expect(submitButton).not.toBeDisabled();
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/correct! your score is/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Close results modal
      closeButton = screen.getByRole("button", { name: /✕/i });
      fireEvent.click(closeButton);

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
      closeButton = screen.getByRole("button", { name: /×/i });
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
