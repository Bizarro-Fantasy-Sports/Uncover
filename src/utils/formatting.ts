/**
 * Formatting utilities for display
 */

/**
 * Convert camelCase to Title Case with spaces
 * Example: "playerInformation" -> "Player Information"
 */
export const camelCaseToTitleCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (char) => char.toUpperCase()) // Capitalize first letter
    .trim();
};

/**
 * Format date for display (MM-DD-YY)
 */
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) {
    return "";
  }

  // Check if date is already in YYYY-MM-DD format as should be from DB
  const yyyymmddPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = dateString.match(yyyymmddPattern);
  if (match) {
    const [, year, month, day] = match;
    return `${month}-${day}-${year.slice(-2)}`;
  }

  try {
    const date = new Date(dateString);
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const year = String(date.getUTCFullYear()).slice(-2);
    return `${month}-${day}-${year}`;
  } catch {
    return dateString;
  }
};
