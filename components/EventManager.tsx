'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CalendarEvent, PERIOD_NAMES } from '@/lib/eventsUtils';
import { Plus, X, Save } from 'lucide-react';

interface EventManagerProps {
  selectedDate: string;
  events?: CalendarEvent[];
  onEventsChange?: (events: CalendarEvent[]) => void;
}

export function EventManager({ selectedDate, events = [], onEventsChange }: EventManagerProps) {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    affectedPeriods: [] as string[],
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) {
      alert('Event title is required');
      return;
    }

    if (newEvent.affectedPeriods.length === 0) {
      alert('Please select at least one period');
      return;
    }

    setIsSaving(true);
    try {
      const event: CalendarEvent = {
        id: `${selectedDate}-${Date.now()}`,
        dateStr: selectedDate,
        title: newEvent.title,
        affectedPeriods: newEvent.affectedPeriods,
        notes: newEvent.notes || undefined
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateStr: selectedDate, event })
      });

      if (!response.ok) throw new Error('Failed to save event');

      onEventsChange?.([...events, event]);
      setNewEvent({ title: '', affectedPeriods: [], notes: '' });
      setIsAddingEvent(false);
    } catch (error) {
      console.error('Failed to add event:', error);
      alert('Failed to add event');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateStr: selectedDate, eventId })
      });

      if (!response.ok) throw new Error('Failed to delete event');

      onEventsChange?.(events.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePeriod = (period: string) => {
    setNewEvent(prev => {
      const periods = prev.affectedPeriods.includes(period)
        ? prev.affectedPeriods.filter(p => p !== period)
        : [...prev.affectedPeriods, period];
      return { ...prev, affectedPeriods: periods };
    });
  };

  return (
    <Card className="bg-card border border-border">
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          📌 Events
        </h3>

        {/* Existing Events */}
        {events.length > 0 && (
          <div className="space-y-2 border-b border-border pb-4">
            {events.map(event => (
              <div
                key={event.id}
                className="p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{event.title}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {event.affectedPeriods.map(period => (
                        <span
                          key={period}
                          className="text-xs px-2 py-0.5 rounded bg-pink-100 dark:bg-pink-900/40 text-pink-900 dark:text-pink-300"
                        >
                          {period}
                        </span>
                      ))}
                    </div>
                    {event.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">{event.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                    disabled={isSaving}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Event Form */}
        {isAddingEvent ? (
          <div className="space-y-3 border-t border-border pt-4">
            <Input
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              className="text-sm"
            />

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">
                Affected Periods
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PERIOD_NAMES.map(period => (
                  <label key={period} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEvent.affectedPeriods.includes(period)}
                      onChange={() => togglePeriod(period)}
                      className="rounded"
                    />
                    <span className="text-xs text-muted-foreground">{period}</span>
                  </label>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="Notes (optional)"
              value={newEvent.notes}
              onChange={(e) => setNewEvent(prev => ({ ...prev, notes: e.target.value }))}
              className="text-xs min-h-20"
            />

            <div className="flex gap-2">
              <Button
                onClick={handleAddEvent}
                disabled={isSaving}
                className="flex-1 gap-2 h-8 text-xs"
              >
                <Save className="h-3 w-3" />
                Save Event
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddingEvent(false)}
                className="flex-1 h-8 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsAddingEvent(true)}
            className="w-full gap-2 h-8 text-xs"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        )}
      </div>
    </Card>
  );
}
