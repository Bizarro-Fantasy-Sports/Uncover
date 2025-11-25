import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Uncover from "./Uncover";

// Mock CSS import
jest.mock("./Uncover.css", () => ({}));

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

// Sample test data
const mockBaseballData: PlayerData[] = [
  {
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
  },
  {
    Name: "Jackie Robinson",
    Bio: "Broke color barrier",
    "Player Information": "Second Baseman",
    "Draft Information": "Signed 1945",
    "Years Active": "1947-1956",
    "Teams Played On": "Brooklyn Dodgers",
    "Jersey Numbers": "42",
    "Career Stats": ".311 AVG, 137 HR",
    "Personal Achievements": "ROY 1947, MVP 1949",
    Photo: ["/images/jackie-robinson.jpg"],
  },
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
      const mockBasketballData: PlayerData[] = [
        {
          Name: "Michael Jordan",
          Bio: "GOAT",
          "Player Information": "",
          "Draft Information": "",
          "Years Active": "",
          "Teams Played On": "",
          "Jersey Numbers": "",
          "Career Stats": "",
          "Personal Achievements": "",
          Photo: ["/mj.jpg"],
        },
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
      const mockFootballData: PlayerData[] = [
        {
          Name: "Tom Brady",
          Bio: "QB GOAT",
          "Player Information": "",
          "Draft Information": "",
          "Years Active": "",
          "Teams Played On": "",
          "Jersey Numbers": "",
          "Career Stats": "",
          "Personal Achievements": "",
          Photo: ["/tb.jpg"],
        },
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
      const mockBasketballData: PlayerData[] = [
        {
          Name: "LeBron James",
          Bio: "King",
          "Player Information": "",
          "Draft Information": "",
          "Years Active": "",
          "Teams Played On": "",
          "Jersey Numbers": "",
          "Career Stats": "",
          "Personal Achievements": "",
          Photo: ["/lbj.jpg"],
        },
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
});
