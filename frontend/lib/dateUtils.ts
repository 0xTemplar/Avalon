// Utility functions for date and time formatting

/**
 * Format a date string for display (e.g., "Dec 15, 2024")
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a date string with time (e.g., "Dec 15, 2024 at 2:30 PM")
 */
export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return dateString;
  }
};

/**
 * Calculate time remaining until a deadline
 */
export const formatTimeRemaining = (deadlineString: string): string => {
  try {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const timeLeft = deadline.getTime() - now.getTime();

    if (timeLeft <= 0) return 'Expired';

    const daysLeft = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
    const hoursLeft = Math.floor(
      (timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
    );
    const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

    if (daysLeft > 0) {
      return `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
    } else if (hoursLeft > 0) {
      return `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} left`;
    } else if (minutesLeft > 0) {
      return `${minutesLeft} minute${minutesLeft > 1 ? 's' : ''} left`;
    } else {
      return 'Less than 1 minute left';
    }
  } catch (error) {
    console.error('Error calculating time remaining:', error);
    return deadlineString;
  }
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const timeDiff = now.getTime() - date.getTime();

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return dateString;
  }
};

/**
 * Check if a deadline has passed
 */
export const isExpired = (deadlineString: string): boolean => {
  try {
    const deadline = new Date(deadlineString);
    const now = new Date();
    return deadline.getTime() <= now.getTime();
  } catch (error) {
    console.error('Error checking if expired:', error);
    return false;
  }
};
