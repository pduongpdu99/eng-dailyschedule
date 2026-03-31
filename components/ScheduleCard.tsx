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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Cập nhật thời gian thực mỗi 30 giây
  useEffect(() => {
    const saved = localStorage.getItem(`schedule-${item.start}-${item.title}`);
    if (saved) setCompleted(JSON.parse(saved));

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // cập nhật mỗi 30 giây (đủ nhanh mà không tốn tài nguyên)

    return () => clearInterval(interval);
  }, [item]);

  const handleToggle = () => {
    const newState = !completed;
    setCompleted(newState);
    localStorage.setItem(`schedule-${item.start}-${item.title}`, JSON.stringify(newState));
  };

  const colors = CATEGORY_COLORS[item.type] || CATEGORY_COLORS.routine;

  // === LOGIC HIGHLIGHT THEO GIỜ HIỆN TẠI ===
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const startMinutes = (() => {
    const [h, m] = item.start.split(':').map(Number);
    return h * 60 + m;
  })();

  const endMinutes = (() => {
    const [h, m] = item.end.split(':').map(Number);
    return h * 60 + m;
  })();

  const isOngoing = nowMinutes >= startMinutes && nowMinutes < endMinutes;
  const isPast = nowMinutes >= endMinutes;
  const isFuture = nowMinutes < startMinutes;

  const duration = calculateDuration(item.start, item.end);

  return (
    <Card 
      className={`
        border-l-4 transition-all duration-300 hover:shadow-md
        ${colors.border} ${colors.bg}
        ${isOngoing 
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg scale-[1.02]' 
          : ''}
        ${isPast ? 'opacity-75' : ''}
        ${isFuture ? 'border-l-4' : ''}
      `}
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{colors.icon}</span>
              <time className="text-sm font-medium text-muted-foreground">
                {item.start} – {item.end}
              </time>

              {/* Badge trạng thái */}
              {isOngoing && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                  Đang diễn ra
                </span>
              )}
              {isPast && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800">
                  Đã qua
                </span>
              )}
            </div>

            <h3 className={`text-lg sm:text-xl font-semibold mb-1 transition-all ${
              isPast ? 'line-through text-muted-foreground' : 'text-foreground'
            }`}>
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
            disabled={isPast} // không cho check nếu đã qua
          >
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}