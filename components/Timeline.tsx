'use client';

import { ScheduleItem } from '@/lib/scheduleUtils';
import { ScheduleCard } from './ScheduleCard';
import { timeToMinutes } from '@/lib/scheduleUtils';

interface TimelineProps {
  schedule: ScheduleItem[];
}

export function Timeline({ schedule }: TimelineProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {schedule.map((item, index) => {
        // Check if there's a gap before this item
        const showGap = index > 0 && (timeToMinutes(item.start) - timeToMinutes(schedule[index - 1].end)) > 0;

        return (
          <div key={`${item.start}-${item.title}`}>
            {showGap && (
              <div className="flex items-center justify-center py-3 sm:py-4">
                <div className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full border border-dashed">
                  Break/Gap
                </div>
              </div>
            )}
            <ScheduleCard item={item} />
          </div>
        );
      })}
    </div>
  );
}
