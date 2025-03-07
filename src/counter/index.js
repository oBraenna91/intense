// Eksempel på en hjelpefunksjon for relativ tid:
export function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date; // tidsforskjell i millisekunder
    const diffInMinutes = Math.floor(diff / 60000);
    const diffInHours = Math.floor(diff / (60000 * 60));
    const diffInDays = Math.floor(diff / (60000 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30); // ca.
    const diffInYears = Math.floor(diffInDays / 365); // ca.
  
    if (diffInMinutes < 10) {
      return "just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
    } else {
      return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
    }
  }
  