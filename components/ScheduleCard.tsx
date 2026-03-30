'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScheduleItem, CATEGORY_COLORS, calculateDuration } from '@/lib/scheduleUtils';
import { Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ScheduleCardProps {
  item: ScheduleItem;
}

export function ScheduleCard({ item }: ScheduleCardProps) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`schedule-${item.start}-${item.title}`);
    if (saved) setCompleted(JSON.parse(saved));
  }, [item]);

  const handleToggle = () => {
    const newState = !completed;
    setCompleted(newState);
    localStorage.setItem(`schedule-${item.start}-${item.title}`, JSON.stringify(newState));
  };

  const colors = CATEGORY_COLORS[item.type] || CATEGORY_COLORS.routine;
  const duration = calculateDuration(item.start, item.end);

  return (
    <Card className={`border-l-4 transition-all ${colors.border} ${colors.bg} hover:shadow-md`}>
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{colors.icon}</span>
              <time className="text-sm font-medium text-muted-foreground">
                {item.start} – {item.end}
              </time>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-1 text-foreground">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {item.detail}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Duration: {duration.hours > 0 ? `${duration.hours}h ` : ''}{duration.minutes}m
            </p>
          </div>
          <Button
            variant={completed ? 'default' : 'outline'}
            size="icon"
            onClick={handleToggle}
            className="flex-shrink-0"
          >
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
