'use client';

import { useState, useEffect } from 'react';
import { CATEGORY_COLORS, ScheduleItem, formatDuration, calculateDuration } from '@/lib/scheduleUtils';
import { Checkbox } from '@/components/ui/checkbox';

interface ScheduleTableProps {
  schedule: ScheduleItem[];
  selectedDate: string;
}

export function ScheduleTable({ schedule, selectedDate }: ScheduleTableProps) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  // Load completed items from localStorage
  useEffect(() => {
    const key = `schedule-${selectedDate}-completed`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setCompleted(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error('Failed to load completed items:', e);
      }
    }
  }, [selectedDate]);

  // Save completed items to localStorage
  useEffect(() => {
    const key = `schedule-${selectedDate}-completed`;
    localStorage.setItem(key, JSON.stringify(Array.from(completed)));
  }, [completed, selectedDate]);

  const toggleCompleted = (id: string) => {
    const newCompleted = new Set(completed);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompleted(newCompleted);
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-background">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="w-24 px-4 py-3 text-left text-sm font-semibold text-foreground">Time</th>
            <th className="w-28 px-4 py-3 text-left text-sm font-semibold text-foreground">Category</th>
            <th className="flex-1 px-4 py-3 text-left text-sm font-semibold text-foreground">Content</th>
            <th className="flex-1 px-4 py-3 text-left text-sm font-semibold text-foreground">Details</th>
            <th className="w-12 px-4 py-3 text-center text-sm font-semibold text-foreground">Done</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((item, index) => {
            const id = `${item.start}-${item.title}`;
            const isCompleted = completed.has(id);
            const colors = CATEGORY_COLORS[item.type] || CATEGORY_COLORS['routine'];
            const { hours, minutes } = calculateDuration(item.start, item.end);
            const duration = formatDuration(hours, minutes);

            return (
              <tr
                key={index}
                className={`border-b border-border transition-colors hover:bg-muted/50 ${
                  isCompleted ? 'bg-muted/30' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {item.start}–{item.end}
                  </span>
                  <div className="text-xs text-muted-foreground">{duration}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}>
                    {colors.icon} {item.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className={`text-sm font-medium ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {item.title}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-muted-foreground">{item.detail}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => toggleCompleted(id)}
                    className="mx-auto"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
