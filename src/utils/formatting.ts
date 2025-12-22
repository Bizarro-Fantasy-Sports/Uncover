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
  try {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${month}-${day}-${year}`;
  } catch {
    return dateString;
  }
};
