'use client';

import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ScheduleTable } from '@/components/ScheduleTable';
import { DateCalendar } from '@/components/DateCalendar';
import { FileImporter } from '@/components/FileImporter';
import { Reflection } from '@/components/Reflection';
import { DailySummary } from '@/components/DailySummary';
import { EventManager } from '@/components/EventManager';
import { SyncButton } from '@/components/SyncButton';
import { ScheduleItem } from '@/lib/scheduleUtils';
import { CalendarEvent } from '@/lib/eventsUtils';
// import { Clock } from 'lucide-react';

export default function Home() {
  const [schedules, setSchedules] = useState<Record<string, ScheduleItem[]>>({});
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [selectedDate, setSelectedDate] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalhost, setIsLocalhost] = useState(false);

  // Ref để scroll đến phần Schedule Table
  const scheduleTableRef = useRef<HTMLDivElement>(null);

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
        // Detect if running on localhost
        const isLocal = typeof window !== 'undefined' && (
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1'
        );
        setIsLocalhost(isLocal);

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
        const dateToUse = schedulesData[today] 
          ? today 
          : (schedulesData['default'] ? 'default' : Object.keys(schedulesData)[0]);
        
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

  // Scroll đến phần Schedule Table (nơi có highlight theo giờ hệ thống)
  const scrollToCurrentTime = () => {
    if (scheduleTableRef.current) {
      scheduleTableRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

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
          <div className={isLocalhost ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <DateCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              schedules={schedules}
              events={events}
            />
          </div>
          {isLocalhost && (
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
          )}
        </div>

        <>
          {/* Summary Section */}
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-foreground">Daily Summary</h2>
            <DailySummary schedule={currentSchedule} />
          </section>

          {/* Schedule Table Section */}
          <section className="mb-12" ref={scheduleTableRef}>
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
        </>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-16 sm:mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <p className="text-center text-sm text-muted-foreground">
            Made with care for productivity and focus
          </p>
        </div>
      </footer>

      {/* Floating Button - Góc dưới bên phải */}
      {/* {currentSchedule.length > 0 && (
        <button
          onClick={scrollToCurrentTime}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full 
                     bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 
                     hover:scale-110 active:scale-95 transition-all duration-200 
                     focus:outline-none focus:ring-4 focus:ring-primary/30"
          aria-label="Scroll to current time"
          title="Nhảy đến thời gian hiện tại"
        >
          <Clock className="h-6 w-6" />
        </button>
      )} */}
    </main>
  );
}