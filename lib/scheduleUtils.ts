export interface ScheduleItem {
  start: string;
  end: string;
  type: string;
  title: string;
  detail: string;
}

export interface DailySchedule {
  date: string;
  schedule: ScheduleItem[];
}

export const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  routine: {
    bg: 'bg-slate-50 dark:bg-slate-900',
    border: 'border-slate-200 dark:border-slate-700',
    text: 'text-slate-700 dark:text-slate-300',
    icon: '✨'
  },
  exercise: {
    bg: 'bg-orange-50 dark:bg-orange-950',
    border: 'border-orange-200 dark:border-orange-700',
    text: 'text-orange-700 dark:text-orange-300',
    icon: '💪'
  },
  listening: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300',
    icon: '🎧'
  },
  speaking: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-200 dark:border-purple-700',
    text: 'text-purple-700 dark:text-purple-300',
    icon: '💬'
  },
  reading: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-700',
    text: 'text-amber-700 dark:text-amber-300',
    icon: '📖'
  },
  writing: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-700',
    text: 'text-green-700 dark:text-green-300',
    icon: '✍️'
  },
  meal: {
    bg: 'bg-rose-50 dark:bg-rose-950',
    border: 'border-rose-200 dark:border-rose-700',
    text: 'text-rose-700 dark:text-rose-300',
    icon: '🍽️'
  },
  break: {
    bg: 'bg-cyan-50 dark:bg-cyan-950',
    border: 'border-cyan-200 dark:border-cyan-700',
    text: 'text-cyan-700 dark:text-cyan-300',
    icon: '☕'
  },
  work: {
    bg: 'bg-indigo-50 dark:bg-indigo-950',
    border: 'border-indigo-200 dark:border-indigo-700',
    text: 'text-indigo-700 dark:text-indigo-300',
    icon: '💼'
  },
  reflection: {
    bg: 'bg-fuchsia-50 dark:bg-fuchsia-950',
    border: 'border-fuchsia-200 dark:border-fuchsia-700',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
    icon: '🧘'
  }
};

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function calculateDuration(start: string, end: string): { hours: number; minutes: number } {
  const diff = timeToMinutes(end) - timeToMinutes(start);
  return {
    hours: Math.floor(diff / 60),
    minutes: diff % 60
  };
}

export function calculateCategoryTotals(schedule: ScheduleItem[]): Record<string, { hours: number; minutes: number }> {
  const totals: Record<string, { hours: number; minutes: number }> = {};

  schedule.forEach(item => {
    const duration = calculateDuration(item.start, item.end);
    const totalMinutes = duration.hours * 60 + duration.minutes;

    if (!totals[item.type]) {
      totals[item.type] = { hours: 0, minutes: 0 };
    }

    const currentTotal = totals[item.type].hours * 60 + totals[item.type].minutes;
    const newTotal = currentTotal + totalMinutes;

    totals[item.type] = {
      hours: Math.floor(newTotal / 60),
      minutes: newTotal % 60
    };
  });

  return totals;
}

export function formatDuration(hours: number, minutes: number): string {
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}
