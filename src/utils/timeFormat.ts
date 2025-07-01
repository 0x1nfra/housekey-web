/**
 * Formats a date to a time string based on the user's preferred time format
 * @param date The date to format
 * @param format The time format preference ('12' or '24')
 * @returns Formatted time string
 */
export const formatTime = (
  date: Date | string,
  format: "12" | "24" = "12"
): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check for invalid date
  if (isNaN(dateObj.getTime())) {
    return "";
  }

  if (format === "24") {
    return dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else {
    return dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
};

/**
 * Formats a date to a date and time string based on the user's preferred time format
 * @param date The date to format
 * @param format The time format preference ('12' or '24')
 * @returns Formatted date and time string
 */
export const formatDateTime = (
  date: Date | string,
  format: "12" | "24" = "12"
): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check for invalid date
  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: format === "24" ? "2-digit" : "numeric",
    minute: "2-digit",
    hour12: format === "12",
  };

  const dateStr = dateObj.toLocaleDateString("en-US", dateOptions);
  const timeStr = dateObj.toLocaleTimeString("en-US", timeOptions);

  return `${dateStr}, ${timeStr}`;
};

/**
 * Converts a time string from one format to another
 * @param timeStr Time string in format "HH:MM" or "hh:mm AM/PM"
 * @param toFormat Target format ('12' or '24')
 * @returns Converted time string
 */
export const convertTimeFormat = (
  timeStr: string,
  toFormat: "12" | "24"
): string => {
  if (!timeStr) return "";

  // Try to parse the time string
  let hours = 0;
  let minutes = 0;
  let isPM = false;

  // Check if it's in 12-hour format with AM/PM
  const twelveHourRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
  const twelveHourMatch = timeStr.match(twelveHourRegex);

  if (twelveHourMatch) {
    hours = parseInt(twelveHourMatch[1], 10);
    minutes = parseInt(twelveHourMatch[2], 10);
    isPM = twelveHourMatch[3].toUpperCase() === "PM";

    // Convert to 24-hour format internally
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
  } else {
    // Assume 24-hour format
    const twentyFourHourRegex = /(\d{1,2}):(\d{2})/;
    const twentyFourHourMatch = timeStr.match(twentyFourHourRegex);

    if (twentyFourHourMatch) {
      hours = parseInt(twentyFourHourMatch[1], 10);
      minutes = parseInt(twentyFourHourMatch[2], 10);
    } else {
      return timeStr; // Return original if we can't parse
    }
  }

  // Format according to target format
  if (toFormat === "24") {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  } else {
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  }
};

/**
 * Returns a date formatter function based on the user's preferred time format
 * @param format The time format preference ('12' or '24')
 * @returns A function that formats dates according to the preference
 */
export const getTimeFormatter = (format: "12" | "24" = "12") => {
  return (date: Date | string) => formatTime(date, format);
};

/**
 * Returns a date-time formatter function based on the user's preferred time format
 * @param format The time format preference ('12' or '24')
 * @returns A function that formats date-times according to the preference
 */
export const getDateTimeFormatter = (format: "12" | "24" = "12") => {
  return (date: Date | string) => formatDateTime(date, format);
};
