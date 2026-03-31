'use client';

import { useState, useEffect } from 'react';
import { CATEGORY_COLORS, ScheduleItem, formatDuration, calculateDuration, timeToMinutes } from '@/lib/scheduleUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Edit2, X } from 'lucide-react';

interface ScheduleTableProps {
  schedule: ScheduleItem[];
  selectedDate: string;
}

const TIME_PERIODS = [
  { name: 'Early Morning', start: 0, end: 360 },
  { name: 'Morning', start: 360, end: 720 },
  { name: 'Noon - Afternoon', start: 720, end: 1020 },
  { name: 'Evening', start: 1020, end: 1260 },
  { name: 'Night', start: 1260, end: 1440 },
];

export function ScheduleTable({ schedule, selectedDate }: ScheduleTableProps) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState<ScheduleItem[]>(schedule);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // ← Thêm dòng này

  // Cập nhật giờ thực tế mỗi 30 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    setEditedSchedule(schedule);
  }, [schedule]);

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

  const handleEditChange = (index: number, field: keyof ScheduleItem, value: string) => {
    const newSchedule = [...editedSchedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setEditedSchedule(newSchedule);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateStr: selectedDate, schedule: editedSchedule }),
      });

      if (!response.ok) throw new Error('Failed to save schedule');

      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to save schedule:', error);
      alert('Failed to save schedule. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedSchedule(schedule);
    setIsEditing(false);
  };

  const getScheduleForPeriod = (period: typeof TIME_PERIODS[0]) => {
    return editedSchedule.filter(item => {
      const startMin = timeToMinutes(item.start);
      return startMin >= period.start && startMin < period.end;
    });
  };

  // Hàm kiểm tra item có đang diễn ra không
  const isItemOngoing = (item: ScheduleItem): boolean => {
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const startMinutes = timeToMinutes(item.start);
    const endMinutes = timeToMinutes(item.end);

    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  };

  const renderTable = (items: ScheduleItem[], periodName: string) => {
    if (items.length === 0) return null;

    return (
      <div key={periodName} className="mb-8">
        <h3 className="mb-4 text-lg font-bold text-foreground">{periodName}</h3>
        <div className="overflow-x-auto rounded-lg border border-border bg-background">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="w-24 px-4 py-3 text-left text-sm font-semibold text-foreground">Time</th>
                <th className="w-28 px-4 py-3 text-left text-sm font-semibold text-foreground">Category</th>
                <th className="flex-1 px-4 py-3 text-left text-sm font-semibold text-foreground">Content</th>
                <th className="flex-1 px-4 py-3 text-left text-sm font-semibold text-foreground">Details</th>
                {/* <th className="w-12 px-4 py-3 text-center text-sm font-semibold text-foreground">Done</th> */}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const originalIndex = editedSchedule.findIndex(
                  i => i.start === item.start && i.title === item.title
                );
                const id = `${item.start}-${item.title}`;
                const isCompleted = completed.has(id);
                const colors = CATEGORY_COLORS[item.type] || CATEGORY_COLORS['routine'];
                const { hours, minutes } = calculateDuration(item.start, item.end);
                const duration = formatDuration(hours, minutes);

                const isOngoing = isItemOngoing(item);

                return (
                  <tr
                    key={index}
                    className={`border-b border-border transition-all hover:bg-muted/50 ${isCompleted ? 'bg-muted/30' : ''
                      } ${isOngoing
                        ? 'bg-primary/10 border-l-4 border-l-primary font-medium'
                        : ''
                      }`}
                  >
                    {isEditing ? (
                      /* Phần edit giữ nguyên */
                      <>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Input
                              value={item.start}
                              onChange={(e) => handleEditChange(originalIndex, 'start', e.target.value)}
                              className="w-20 text-xs"
                              placeholder="HH:MM"
                            />
                            <span className="py-2 text-xs">–</span>
                            <Input
                              value={item.end}
                              onChange={(e) => handleEditChange(originalIndex, 'end', e.target.value)}
                              className="w-20 text-xs"
                              placeholder="HH:MM"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={item.type}
                            onChange={(e) => handleEditChange(originalIndex, 'type', e.target.value)}
                            className="text-xs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={item.title}
                            onChange={(e) => handleEditChange(originalIndex, 'title', e.target.value)}
                            className="text-xs"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            value={item.detail}
                            onChange={(e) => handleEditChange(originalIndex, 'detail', e.target.value)}
                            className="text-xs"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Checkbox checked={isCompleted} onCheckedChange={() => toggleCompleted(id)} disabled />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <span className={`font-mono text-sm font-medium ${isOngoing ? 'text-primary' : 'text-foreground'}`}>
                            {item.start}–{item.end}
                          </span>
                          <div className="text-xs text-muted-foreground">{duration}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${colors.bg} ${colors.text}`}>
                            {colors.icon} {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`text-sm font-medium ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'} ${isOngoing ? 'text-primary' : ''}`}>
                            {item.title}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-muted-foreground">{item.detail}</div>
                        </td>
                        {/* <td className="px-4 py-3 text-center">
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => toggleCompleted(id)}
                            className="mx-auto"
                          />
                        </td> */}
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex gap-2 justify-end">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="h-4 w-4" /> Edit Schedule
          </Button>
        )}
      </div>

      {/* Tables grouped by time period */}
      {TIME_PERIODS.map(period => renderTable(getScheduleForPeriod(period), period.name))}
    </div>
  );
}