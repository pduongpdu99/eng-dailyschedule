'use client';

import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ScheduleTable } from '@/components/ScheduleTable';
import { DateCalendar } from '@/components/DateCalendar';
import { FileImporter } from '@/components/FileImporter';
import { Summary } from '@/components/Summary';
import { Reflection } from '@/components/Reflection';
import { EventManager } from '@/components/EventManager';
import { SyncButton } from '@/components/SyncButton';
import { ScheduleItem } from '@/lib/scheduleUtils';
import { CalendarEvent } from '@/lib/eventsUtils';

export default function Home() {
  const [schedules, setSchedules] = useState<Record<string, ScheduleItem[]>>({});
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [selectedDate, setSelectedDate] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(true);

  // Get today's date in local timezone
  const getTodayDateStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [schedulesRes, eventsRes] = await Promise.all([
          fetch('/api/schedules'),
          fetch('/api/events')
        ]);
        
        const schedulesData = await schedulesRes.json();
        const eventsData = await eventsRes.json();
        
        setSchedules(schedulesData);
        setEvents(eventsData);
        
        // Set selected date to today or first available date
        const today = getTodayDateStr();
        const dateToUse = schedulesData[today] ? today : (schedulesData['default'] ? 'default' : Object.keys(schedulesData)[0]);
        setSelectedDate(dateToUse || 'default');
      } catch (error) {
        console.error('Failed to load data:', error);
        setSelectedDate('default');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleImport = (dateStr: string, schedule: ScheduleItem[]) => {
    setSchedules((prev) => ({
      ...prev,
      [dateStr]: schedule,
    }));
    setSelectedDate(dateStr);
  };

  const currentSchedule = schedules[selectedDate] || [];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
                Daily Schedule Manager
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-muted-foreground">
          Loading schedules...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
              Daily Schedule Manager
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Organize your day with precision
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Calendar and Importer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2">
            <DateCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              schedules={schedules}
              events={events}
            />
          </div>
          <div className="space-y-4">
            <SyncButton />
            <FileImporter onImport={handleImport} />
            <EventManager
              selectedDate={selectedDate}
              events={events[selectedDate] || []}
              onEventsChange={(updatedEvents) => {
                setEvents(prev => ({
                  ...prev,
                  [selectedDate]: updatedEvents
                }));
              }}
            />
          </div>
        </div>

        {/* Summary Section */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-foreground">Daily Summary</h2>
          <Summary schedule={currentSchedule} />
        </section>

        {/* Schedule Table Section */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-foreground">
            Schedule for {selectedDate === 'default' ? 'Today' : selectedDate}
          </h2>
          <ScheduleTable schedule={currentSchedule} selectedDate={selectedDate} />
        </section>

        {/* Reflection Section */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-foreground">Daily Reflection</h2>
          <Reflection selectedDate={selectedDate} />
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-16 sm:mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <p className="text-center text-sm text-muted-foreground">
            Made with care for productivity and focus
          </p>
        </div>
      </footer>
    </main>
  );
}
