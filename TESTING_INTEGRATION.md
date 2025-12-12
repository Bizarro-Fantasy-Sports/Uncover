# Integration Testing Guide - Full Stack Athlete Unknown

This guide explains how to test the full integration between the Frontend and Backend API.

## Overview

The application now fetches player data and round statistics from a backend API instead of using hardcoded data. When a user completes a game, the results are submitted back to the API.

## Configuration

### Environment Variables

The app uses environment variables to configure the API connection:

- `.env.local` - Your local development configuration (not committed to git)
- `.env.example` - Example configuration template

**Important Files:**
- `src/config/api.ts` - API configuration and endpoints
- `src/services/api.ts` - API client service
- `src/services/gameData.ts` - Unified data service (switches between API and mock data)
- `src/services/mockData.ts` - Mock data fallback

## Setup Instructions

### 1. Configure Environment

Create or edit `.env.local` in the project root:

```bash
# Use API mode (connect to backend)
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_USE_MOCK_DATA=false
```

**OR** use mock data mode (no backend required):

```bash
# Use mock data mode (for FE-only testing)
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_USE_MOCK_DATA=true
```

### 2. Set Up Local Backend

You need to have the backend API running locally. The backend should provide these endpoints:

#### Required API Endpoints

**GET `/api/players/:sport/:date`**
- Returns player data for the specified sport and date
- Example: `GET /api/players/baseball/2025-12-06`
- Response format:
```json
{
  "Name": "Jackie Robinson",
  "Bio": "First African American to play in MLB...",
  "Player Information": "Position: 2B, Bats: Right, Throws: Right",
  "Draft Information": "Signed as amateur free agent",
  "Years Active": "1947-1956",
  "Teams Played On": "Brooklyn Dodgers",
  "Jersey Numbers": "42",
  "Career Stats": ".311 BA, 137 HR, 734 RBI",
  "Personal Achievements": "6x All-Star, 1949 MVP...",
  "Photo": ["/images/jackie-robinson.jpg"],
  "dailyNumber": 1,
  "playDate": "2025-12-06",
  "sport": "baseball"
}
```

**GET `/api/round-stats/:sport/:date`**
- Returns aggregated statistics for all players who played that day
- Example: `GET /api/round-stats/baseball/2025-12-06`
- Response format:
```json
{
  "playDate": "2025-12-06",
  "sport": "baseball",
  "totalPlays": 100,
  "percentageCorrect": 81,
  "averageScore": 55,
  "averageCorrectScore": 88,
  "highestScore": 97,
  "mostCommonFirstTileFlipped": "playerInformation",
  "mostCommonLastTileFlipped": "photo",
  "mostCommonTileFlipped": "teamsPlayedOn",
  "leastCommonTileFlipped": "bio",
  "mostFlippedTracker": {
    "bio": 11,
    "careerStats": 11,
    ... (all 9 tiles)
  },
  "firstFlippedTracker": { ... },
  "lastFlippedTracker": { ... }
}
```

**POST `/api/game-results`**
- Receives game results when a player completes the game
- Request body:
```json
{
  "userId": "temp_user_123",
  "sport": "baseball",
  "playDate": "2025-12-06",
  "playerName": "Jackie Robinson",
  "score": 85,
  "tilesFlipped": 5,
  "incorrectGuesses": 2,
  "flippedTilesPattern": [true, false, true, true, false, false, true, true, false],
  "firstTileFlipped": "playerInformation",
  "lastTileFlipped": "photo",
  "completed": true,
  "completedAt": "2025-12-06T10:30:00.000Z",
  "rank": "Elite"
}
```
- Response:
```json
{
  "success": true,
  "message": "Results submitted successfully",
  "roundStats": { ... updated round stats ... }
}
```

### 3. Start the Backend API

Follow your backend project's instructions to start the API server. The default configuration expects it to run on `http://localhost:8080`.

### 4. Start the Frontend

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm start
```

The app will open at `http://localhost:3000`.

## Testing Scenarios

### Test 1: API Mode with Backend Running

**Setup:**
```bash
REACT_APP_USE_MOCK_DATA=false
```

**Backend:** Running on port 8080

**Steps:**
1. Open the app at `http://localhost:3000`
2. Check browser console - you should see:
   ```
   GameDataService initialized - Using API data
   [API] Fetching player data for baseball on today
   [API] Fetching round stats for baseball on today
   ```
3. Play the game normally
4. When you guess correctly, check console:
   ```
   [Game] Submitting game results: { ... }
   [Game] Results submitted successfully
   ```
5. Check your backend logs to verify the POST request was received

**Expected Results:**
- Player data loads from API
- Round stats load from API
- Game results are submitted to API when you win
- Today's Stats modal shows real data from API

### Test 2: API Mode with Backend NOT Running (Fallback to Mock)

**Setup:**
```bash
REACT_APP_USE_MOCK_DATA=false
```

**Backend:** Stopped

**Steps:**
1. Start the frontend only
2. Check browser console - you should see:
   ```
   GameDataService initialized - Using API data
   [API] Fetching player data for baseball on today
   [API] Failed to fetch player data, falling back to mock data: ...
   [MOCK] Fetching player data for baseball
   ```

**Expected Results:**
- API calls fail gracefully
- App automatically falls back to mock data (loads from local JSON files)
- Game is still playable
- No errors disrupt user experience

### Test 3: Mock Data Mode (No Backend Required)

**Setup:**
```bash
REACT_APP_USE_MOCK_DATA=true
```

**Backend:** Not needed

**Steps:**
1. Start the frontend
2. Check browser console:
   ```
   GameDataService initialized - Using MOCK data
   [MOCK] Fetching player data for baseball
   [MOCK] Fetching round stats for baseball
   ```
3. Play the game
4. When you win:
   ```
   [MOCK] Game results not submitted (mock mode)
   ```

**Expected Results:**
- All data loads from local JSON files and mock data service
- No API calls are made
- Game results are logged but not submitted
- Useful for frontend development without backend

### Test 4: Switch Between Sports

**Steps:**
1. Load the app (with backend running)
2. Play baseball
3. Click "BASKETBALL" tab
4. Check console - should see new API calls:
   ```
   [API] Fetching player data for basketball on today
   [API] Fetching round stats for basketball on today
   ```
5. Switch to football - same behavior

**Expected Results:**
- Each sport loads its own player data from API
- Each sport has separate round stats
- Switching between sports triggers new API calls (only first time per sport)

### Test 5: Results Submission After Winning

**Steps:**
1. Play the game (with backend running)
2. Guess the player correctly
3. Check console for submission:
   ```
   [Game] Submitting game results: {
     userId: "temp_user_123",
     sport: "baseball",
     playDate: "2025-12-06",
     score: 85,
     tilesFlipped: 5,
     ...
   }
   ```
4. Verify in backend that the data was received

**Expected Results:**
- Results are submitted exactly once per game
- Submission includes all game data (score, tiles flipped, first/last tile, etc.)
- LocalStorage prevents duplicate submissions
- Backend receives correct data format

### Test 6: Error Handling

**Test 6a: Backend Returns 500 Error**
1. Configure backend to return 500 for player data
2. Start the app
3. Should fall back to mock data automatically

**Test 6b: Backend Returns Invalid JSON**
1. Configure backend to return malformed JSON
2. Start the app
3. Should show error message with retry button

**Test 6c: Network Timeout**
1. Configure backend with slow response (>10 seconds)
2. Start the app
3. Should timeout and fall back to mock data

## Debugging Tips

### Console Logging

The app has extensive console logging prefixed with:
- `[API]` - API service calls
- `[MOCK]` - Mock data service calls
- `[Game]` - Game logic and result submission

### Check Network Tab

Open browser DevTools > Network tab to see:
- GET requests to `/api/players/:sport/:date`
- GET requests to `/api/round-stats/:sport/:date`
- POST request to `/api/game-results` (when you win)

### LocalStorage Inspection

Check Application > LocalStorage in DevTools:
- `playerIndex_baseball` - Current player index for baseball
- `submitted_baseball_2025-12-06` - Prevents duplicate result submission

### Common Issues

**Issue: "Loading player data..." never completes**
- Check if backend is running
- Check CORS configuration on backend
- Check network tab for failed requests
- Verify API_BASE_URL in .env.local

**Issue: Mock data loads instead of API data**
- Check `REACT_APP_USE_MOCK_DATA` is set to `false`
- Restart the dev server after changing .env.local
- Check console to see which mode is active

**Issue: Results not submitting**
- Check if you already submitted for this game (check localStorage)
- Verify backend POST endpoint is working
- Check console for submission errors
- Verify request payload format

## Next Steps

### TODO: Add User Authentication

Currently using hardcoded userId: `"temp_user_123"`. Replace with actual user ID from your auth system:

```typescript
// In Uncover.tsx, line 183
userId: "temp_user_123", // TODO: Replace with actual user ID from auth
```

### TODO: Environment-Specific Configuration

For production, update the API base URL:

```bash
# .env.production
REACT_APP_API_BASE_URL=https://api.statsland.com
REACT_APP_USE_MOCK_DATA=false
```

## Summary

The integration is complete! The frontend now:
- ✅ Fetches player data from backend API
- ✅ Fetches round statistics from backend API
- ✅ Submits game results when player wins
- ✅ Falls back to mock data if API fails
- ✅ Handles errors gracefully
- ✅ Supports easy switching between API and mock data modes
- ✅ Includes comprehensive logging for debugging

All hardcoded data has been removed and replaced with API calls!
