'use client';

import { useRef, useState } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScheduleItem } from '@/lib/scheduleUtils';

interface FileImporterProps {
  onImport: (dateStr: string, schedule: ScheduleItem[]) => void;
}

export function FileImporter({ onImport }: FileImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateScheduleItem = (item: any): item is ScheduleItem => {
    return (
      typeof item === 'object' &&
      typeof item.start === 'string' &&
      typeof item.end === 'string' &&
      typeof item.type === 'string' &&
      typeof item.title === 'string' &&
      typeof item.detail === 'string'
    );
  };

  // Convert local date to string in YYYY-MM-DD format
  const getLocalDateStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Handle both formats: single schedule or date-keyed schedules
      let dateStr = '';
      let schedule: ScheduleItem[] = [];

      if (Array.isArray(data)) {
        // If it's an array, treat it as today's schedule
        dateStr = getLocalDateStr();
        schedule = data;
      } else if (data.date && Array.isArray(data.schedule)) {
        // Format with date property
        dateStr = data.date === 'default' ? getLocalDateStr() : data.date;
        schedule = data.schedule;
      } else if (typeof data === 'object') {
        // Format: date string keys mapping to schedules
        // Use the first date found
        const entries = Object.entries(data).filter(
          ([_, val]) => Array.isArray(val)
        ) as [string, unknown[]][];
        
        if (entries.length === 0) {
          throw new Error('No valid schedules found in file');
        }

        for (const [date, items] of entries) {
          if (!Array.isArray(items)) continue;
          
          const validSchedule = items.every(validateScheduleItem);
          if (!validSchedule) {
            throw new Error('Invalid schedule format in file');
          }

          dateStr = date === 'default' ? getLocalDateStr() : date;
          schedule = items;
          break;
        }
      }

      // Validate schedule items
      if (!Array.isArray(schedule)) {
        throw new Error('Schedule must be an array');
      }

      const allValid = schedule.every(validateScheduleItem);
      if (!allValid) {
        throw new Error('Some items in schedule are invalid. Required fields: start, end, type, title, detail');
      }

      // Save to backend
      const saveResponse = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateStr, schedule }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save schedule to server');
      }

      onImport(dateStr, schedule);
      setMessage({
        type: 'success',
        text: `Successfully imported schedule for ${dateStr} (${schedule.length} items)`,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to parse file';
      setMessage({
        type: 'error',
        text: `Import failed: ${errorMsg}`,
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {isLoading ? 'Importing...' : 'Import Schedule (JSON)'}
      </Button>

      {message && (
        <Alert
          variant={message.type === 'error' ? 'destructive' : 'default'}
          className={message.type === 'success' ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950' : ''}
        >
          {message.type === 'success' ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800 dark:text-green-200' : ''}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
