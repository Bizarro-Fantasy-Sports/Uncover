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
