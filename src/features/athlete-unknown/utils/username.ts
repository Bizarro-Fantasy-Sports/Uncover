/**
 * Username Validation Utilities
 * Client-side validation matching backend requirements
 */

const PROFANITY_LIST = [
  "fuck",
  "shit",
  "damn",
  "bitch",
  "ass",
  "bastard",
  "hell",
  "crap",
];

/**
 * Check if username contains inappropriate content
 * @param username - The username to check
 * @returns true if inappropriate, false otherwise
 */
export function isInappropriateName(username: string): boolean {
  const lowerUsername = username.toLowerCase();
  return PROFANITY_LIST.some((word) => lowerUsername.includes(word));
}

/**
 * Validate username according to requirements:
 * - Length between 3 and 20 characters
 * - Only alphanumeric characters and spaces
 * - No consecutive spaces
 * - No inappropriate content
 * @param username - The username to validate
 * @returns Error message if invalid, null if valid
 */
export function validateUsername(username: string): string | null {
  const trimmedUsername = username.trim();

  // Check length
  if (trimmedUsername.length < 3) {
    return "Username must be at least 3 characters";
  }

  if (trimmedUsername.length > 20) {
    return "Username must be 20 characters or less";
  }

  // Check for valid characters (only letters, numbers, and spaces)
  const validCharactersRegex = /^[a-zA-Z0-9 ]+$/;
  if (!validCharactersRegex.test(trimmedUsername)) {
    return "Username can only contain letters, numbers, and spaces";
  }

  // Check for consecutive spaces
  if (trimmedUsername.includes("  ")) {
    return "Username cannot contain consecutive spaces";
  }

  // Check for inappropriate content
  if (isInappropriateName(trimmedUsername)) {
    return "Username contains inappropriate content";
  }

  return null;
}

/**
 * Generate a default username based on email
 * Format: Guest{1-999}{FirstLetterOfEmail}
 * @param email - User's email address
 * @returns Generated default username
 */
export function generateDefaultUsername(email: string): string {
  const randomNum = Math.floor(Math.random() * 999) + 1;
  const firstLetter = email && email.length > 0 ? email[0].toUpperCase() : "A";
  return `Guest${randomNum}${firstLetter}`;
}
