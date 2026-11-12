/**
 * Dates in Pakistan Standard Time.
 *
 * Seasonality is decided against the market's own calendar, not the visitor's device clock, so a
 * shopper abroad sees the same "in season now" items as one standing in the mandi.
 */

/** Midnight today in Asia/Karachi, expressed as a UTC instant for date-only arithmetic. */
export function marketToday(): Date {
  const ymd = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  return new Date(`${ymd}T00:00:00Z`);
}

/** The current month in Asia/Karachi, 1-12. */
export function marketMonth(): number {
  return marketToday().getUTCMonth() + 1;
}
