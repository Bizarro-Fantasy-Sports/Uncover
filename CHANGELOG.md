# Changelog

All notable changes to the Statsland Website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Types of Changes

- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.

## [Unreleased]

## [PR-45]

### Added

- Lots of refactoring and bug fixes
- Round History to play rounds in the past (and in the future for playtester role)
- Use history from userStats to autocomplete already finished rounds. If not found, use localStorage for guest users
- For 401 Unauthorized failures for userStats, use localStorage for guest users' user stats
- Pass timezone to POST /results for BE to accurately calculate currentDailyStreak

## [PR-44]

### Added

- Added 2 more tiles that aren't part of the grid, Initials and Nicknames
- Order of sports in header (and default sport) handled by environment variables

### Changed

- Changed models to reflect new tiles
- Consolidated ResultsModal and RoundStatsModal into RoundResultsModal
- Changed way tiles are displayed (no more boolean[] to keep track of flips)
- Changed roundId separator to "#"
- Removed unnecessary pieces of GameState
- Now to get the round correct after a close guess, the next guess has to be closer than the previous to be accepted

## [PR-43]

### Added

- New template.yaml file to be run by sam to deploy infrastructure stack to AWS

### Changed

- Centralized and refactored environment variable usage

## [PR-42]

### Added

- Implement automatic user stats migration after first login

## [PR-40]

### Fixed

- Use UserStats model instead of new GuestStats model since the point of guest stats is that they will eventually be migrated to being a user anyways

## [PR-39]

### Added

- LocalStorage statistics tracking for guest (non-authenticated) users
  - Automatically saves comprehensive game statistics upon round completion
  - Storage key: `guestStats`
  - Tracks stats per sport: basketball, baseball, football
  - Statistics tracked include:
    - Total plays and percentage correct
    - Highest score and average correct score
    - Average number of tile flips
    - Most/least common tiles flipped (first, last, and overall)
    - Detailed tile flip trackers for all 9 tile types
  - Mirrors backend statistics calculation logic
  - Only updates stats for guest users (authenticated users use backend)
  - Console logging for debugging stats updates

### Changed

- Enhanced `useGameData` hook to accept `isGuest` parameter
- Updated `AthleteUnknown` component to detect authentication status
- Passes `!isAuthenticated` as `isGuest` to useGameData hook

### Technical Details

- Created `guestStats.ts` utility module with:
  - `GuestSportStats` interface matching backend stats model
  - `TileTracker` interface for tracking tile flip counts
  - `GuestGameResult` interface for game completion data
  - `loadGuestStats()` - Load all guest stats from localStorage
  - `updateGuestStats()` - Update stats with new game result
  - `clearGuestStats()` - Clear all guest stats
- Stats calculation includes:
  - Running averages for scores and tile flips
  - Percentage calculations
  - Tile frequency tracking across three dimensions
  - Most/least common tile determination

### Impact

- Guest users now have persistent statistics across sessions
- Enables future features like guest leaderboards
- Provides data for improving guest-to-authenticated conversion
- Stats format matches backend for seamless migration when user signs up

## [PR-38]

### Added

- LocalStorage persistence for mid-round game progress across all users
  - Automatically saves game state after each action (tile flips, guesses, score updates)
  - Restores in-progress games when user reopens tab or refreshes page
  - Storage key format: `currentSession_<sport>_<playDate>`
  - Saved data includes: score, tiles flipped, hints, guesses, messages, and all game state
  - Automatically clears saved progress when round is completed or user gives up
  - Console logging for debugging save/load/clear operations

### Changed

- Enhanced `useGameState` hook to automatically save and restore game progress
- Added `MidRoundProgress` interface for type-safe localStorage operations
- Extended storage utilities with new functions: `saveMidRoundProgress`, `loadMidRoundProgress`, `clearMidRoundProgress`

### Impact

- Users can now safely close/refresh the browser without losing their progress
- Improves user experience by eliminating frustration from accidental tab closures
- Works for both authenticated and guest users
- No performance impact - saves are non-blocking and use efficient localStorage API

## [PR-37]

### Changed

- User stats are now retrieved and shown in the user stats modal
- Clean up model changes
- Refactor for cleaner code

## [PRs 26-34]

### Changed

- Updated GitHub actions script versions
- Dependabot package version upgrades

## [PR-35 & PR-36]

### Fixed

- Fixed web-vitals v5 API compatibility in reportWebVitals.ts
- Fix changelog reminder workflow syntax error

## [PR-25]

### Added

- Added FE deploy pipline

## [PR-24]

### Changed

- Each sport's Athlete Unknown is its own URL
- Future refactoring required

## [PR-22]

### Changed

- theme field replaced previouslyPlayedDates and averageCorrectScore replaced averageScore in Round
- submitting the user’s stats to the “/results” endpoint to update user and round stats is not called when the round is determined correct via the “close enough”

### Added

- Tooltip for flipped tile theme reminder
- Photo and name of correct answer player in results modal when finished

## [PR-21]

### Added

- Added playtesting mode : including playtester role check, date picker for future rounds, and API future round read

## [PR-20](https://github.com/Statsland-Fantasy/statsland-website/pull/20)

### Added

- React Router to handle URL navigation
- Barrel exporting for simpler grouped together importing
- Path aliasing to enable absolute vs relative import paths

### Changed

- Project structure to better match bulletproof react's structure
- Removed all default exports. All exports (and imports) are named now
- Functional component arrow functions converted to normal function notation

## [PR-19](https://github.com/Statsland-Fantasy/statsland-website/pull/19)

### Added

- Reorganized all AthleteUnknown related files to be in its own directory. All components, API service files, types, utils, config, etc
- Broke up large AthleteUnknown.tsx file to have individual files for custom hooks, utils, and UI components

## [PR-18](https://github.com/Statsland-Fantasy/statsland-website/pull/18)

### Added

- Auth0 integration
- Added makeshift login button

## [PR-17](https://github.com/Statsland-Fantasy/statsland-website/pull/17)

### Changed

- Changed tile names to be Lower Camel Case instead of space-separated Title Case
- Fix photo type

## [PR-16](https://github.com/Statsland-Fantasy/statsland-website/pull/16)

### Added

- Added CHANGELOG

## [PR-15](https://github.com/Statsland-Fantasy/statsland-website/pull/15)

### Added

- Created config file with configurable variables

## [PR-14](https://github.com/Statsland-Fantasy/statsland-website/pull/14)

### Changed

- Allow configuration to call real BE API

## [PR-13](https://github.com/Statsland-Fantasy/statsland-website/pull/13)

### Changed

- Renamed all instances of Uncover to Athlete Unknown
- Small bug fixes

## [PR-12](https://github.com/Statsland-Fantasy/statsland-website/pull/12)

### Added

- Add credit to Sports Reference

## [PR-11](https://github.com/Statsland-Fantasy/statsland-website/pull/11)

### Added

- Guest user session persistence with localStorage

## [PR-10](https://github.com/Statsland-Fantasy/statsland-website/pull/10)

### Changed

- New Game Requirements

## [PR-9](https://github.com/Statsland-Fantasy/statsland-website/pull/9)

### Added

- Rules modal with comprehensive game instructions and hover tooltips
- Tooltips for Personal Achievements and Photo tiles

## [PR-8](https://github.com/Statsland-Fantasy/statsland-website/pull/8)

### Added

- Today's Stats modal showing round statistics
- Mock data for displaying round stats on frontend

## [PR-7](https://github.com/Statsland-Fantasy/statsland-website/pull/7)

### Added

- User stats modal and button to Athlete Unknown game
- User statistics tracking with mock data

## [PR-6](https://github.com/Statsland-Fantasy/statsland-website/pull/6)

### Added

- Converted entire JavaScript codebase to TypeScript
- Restructured project directory for better organization

## [PR-5](https://github.com/Statsland-Fantasy/statsland-website/pull/5)

### Added

- Matched Uncover UI to design mockup

## [PR-4](https://github.com/Statsland-Fantasy/statsland-website/pull/4)

### Added

- ESLint & prettier configuration files and formatting

## [PR-3](https://github.com/Statsland-Fantasy/statsland-website/pull/3)

### Added

- Validation to prevent empty player name guesses

## [PR-2](https://github.com/Statsland-Fantasy/statsland-website/pull/2)

### Added

- Comprehensive unit tests for Uncover game

## [PR-1](https://github.com/Statsland-Fantasy/statsland-website/pull/1)

### Added

- Tile flip puzzle feature replacing photo modal
- Updated animations for tile reveals
- AI-assisted implementation

## [0.1.0] - 2025-11-06

### Added

- Initial Uncover game implementation

## [0.0.1] - 2025-10-30

### Added

- Initial React application setup
