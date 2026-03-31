'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { ScheduleItem, calculateCategoryTotals } from '@/lib/scheduleUtils';
import { CalendarEvent } from '@/lib/eventsUtils';

interface DateCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  schedules: Record<string, ScheduleItem[]>;
  events?: Record<string, CalendarEvent[]>;
}

export function DateCalendar({ selectedDate, onDateSelect, schedules, events = {} }: DateCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  // Get today's date in local timezone
  const getTodayDateStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDateStr = getTodayDateStr();

  // Convert date to string in local timezone
  const dateToString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const days = useMemo(() => {
    const firstDay = firstDayOfMonth(currentMonth);
    const totalDays = daysInMonth(currentMonth);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = dateToString(date);
      days.push({ date, dateStr, day });
    }

    return days;
  }, [currentMonth]);

  const getDateSummary = (dateStr: string) => {
    const schedule = schedules[dateStr];
    if (!schedule || schedule.length === 0) {
      return 'No schedule';
    }

    const totals = calculateCategoryTotals(schedule);
    const top3 = Object.entries(totals)
      .sort((a, b) => (b[1].hours * 60 + b[1].minutes) - (a[1].hours * 60 + a[1].minutes))
      .slice(0, 3);

    return top3.map(([type, duration]) => `${type}: ${duration.hours}h ${duration.minutes}m`).join('\n');
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">{monthName}</h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousMonth}
              className="h-8 w-8 hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8 hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day headers */}
        <div className="mb-4 grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const isSelected = day.dateStr === selectedDate;
            const isToday = day.dateStr === todayDateStr;
            const hasSchedule = day.dateStr in schedules;
            const hasEvent = day.dateStr in events;
            const dateStr = day.dateStr;

            return (
              <HoverCard key={day.dateStr}>
                <HoverCardTrigger asChild>
                  <button
                    onClick={() => onDateSelect(day.dateStr)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg p-2 text-sm font-medium transition-all duration-200 relative group ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-md scale-105'
                        : hasEvent
                        ? 'bg-pink-100 dark:bg-pink-900/20 text-foreground border-2 border-pink-400 dark:border-pink-600'
                        : isToday
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-foreground border-2 border-orange-400 dark:border-orange-600'
                        : hasSchedule
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-foreground border-2 border-blue-300 dark:border-blue-700'
                        : 'text-muted-foreground hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <span className="relative z-10">{day.day}</span>
                    
                    {/* Visual indicator for dates with data */}
                    {hasEvent && !isSelected && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1.5 w-1.5 bg-pink-500 rounded-full" />
                    )}
                    {hasSchedule && !isSelected && !hasEvent && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1.5 w-1.5 bg-blue-500 rounded-full" />
                    )}
                    {isToday && !isSelected && !hasEvent && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1.5 w-1.5 bg-orange-500 rounded-full" />
                    )}
                    {isSelected && (hasSchedule || isToday || hasEvent) && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1.5 w-1.5 bg-primary-foreground rounded-full" />
                    )}
                  </button>
                </HoverCardTrigger>
                {hasSchedule && (
                  <HoverCardContent className="w-72 shadow-lg">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <p className="font-semibold text-foreground">{day.dateStr}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Top Activities
                        </p>
                        <p className="text-sm text-foreground whitespace-pre-line font-medium leading-relaxed">
                          {getDateSummary(dateStr)}
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                )}
              </HoverCard>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-2 rounded-lg bg-muted/30 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-pink-100 dark:bg-pink-900/20 border-2 border-pink-400 dark:border-pink-600 flex items-center justify-center text-xs font-medium">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500" />
              </div>
              <span className="text-xs text-muted-foreground">Has event</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 flex items-center justify-center text-xs font-medium">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              </div>
              <span className="text-xs text-muted-foreground">Has schedule</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-600 flex items-center justify-center text-xs font-medium">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              </div>
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                31
              </div>
              <span className="text-xs text-muted-foreground">Selected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple calendar icon fallback
function Calendar({ className }: { className: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}
