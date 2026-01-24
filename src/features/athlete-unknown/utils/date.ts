/**
 * Get current date in YYYY-MM-DD format using browser's local timezone
 */
function getCurrentDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateString(isoDateTimeString: string): string {
  const [datePart] = isoDateTimeString.split("T"); // "YYYY-MM-DDT00:00:000Z"
  const [year, month, day] = datePart.split("-");
  return `${month}-${day}-${year}`;
}

export { getCurrentDateString, getDateString };
