import { Card } from '@/components/ui/card';
import { ScheduleItem, calculateCategoryTotals, formatDuration } from '@/lib/scheduleUtils';

interface SummaryProps {
  schedule: ScheduleItem[];
}

export function Summary({ schedule }: SummaryProps) {
  const totals = calculateCategoryTotals(schedule);

  // Map categories to display names
  const displayCategories: Record<string, string> = {
    listening: 'Listening Practice',
    reading: 'Reading Practice',
    writing: 'Writing Practice',
    speaking: 'Speaking Practice',
    exercise: 'Exercise',
    work: 'Work',
    meal: 'Meals',
    break: 'Breaks',
    routine: 'Routine',
    reflection: 'Reflection',
  };

  const relevantCategories = ['listening', 'reading', 'writing', 'exercise', 'work', 'break'];
  const filteredTotals = Object.entries(totals).filter(([key]) =>
    relevantCategories.includes(key)
  );

  return (
    <Card className="bg-gradient-to-br from-background to-muted/30 border border-border">
      <div className="p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-foreground">Daily Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTotals.map(([category, duration]) => (
            <div
              key={category}
              className="p-4 rounded-lg bg-background border border-border/50 hover:border-border transition-colors"
            >
              <p className="text-sm text-muted-foreground font-medium">
                {displayCategories[category] || category}
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {formatDuration(duration.hours, duration.minutes)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
