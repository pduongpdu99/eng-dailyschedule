export interface CalendarEvent {
  id: string;
  dateStr: string;
  title: string;
  affectedPeriods: string[]; // Array of period names like 'Morning', 'Afternoon', etc.
  notes?: string;
}

export const PERIOD_NAMES = ['Early Morning', 'Morning', 'Noon - Afternoon', 'Evening', 'Night'];

export const getPeriodFromTime = (timeStr: string): string => {
  const [hours] = timeStr.split(':').map(Number);
  
  if (hours >= 0 && hours < 6) return 'Early Morning';
  if (hours >= 6 && hours < 12) return 'Morning';
  if (hours >= 12 && hours < 17) return 'Noon - Afternoon';
  if (hours >= 17 && hours < 21) return 'Evening';
  return 'Night';
};

export const isTimeInPeriods = (timeStr: string, affectedPeriods: string[]): boolean => {
  return affectedPeriods.includes(getPeriodFromTime(timeStr));
};
