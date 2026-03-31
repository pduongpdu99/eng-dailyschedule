'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, Check, AlertCircle } from 'lucide-react';

export function SyncButton() {
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Check if running on localhost
    const isLocal = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname.startsWith('192.168.'));
    setIsLocalhost(isLocal);
  }, []);

  const handleSync = async () => {
    setIsLoading(true);
    setSyncMessage(null);

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      setSyncMessage({
        type: 'success',
        text: `Synced to MongoDB: Schedules (${data.results.schedules?.count || 0}), Reflections (${data.results.reflections?.count || 0}), Events (${data.results.events?.count || 0})`
      });
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Sync failed'
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  if (!isLocalhost) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSync}
        disabled={isLoading}
        variant="outline"
        className="w-full gap-2 justify-center"
      >
        {isLoading ? (
          <>
            <Cloud className="h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <Cloud className="h-4 w-4" />
            Sync to MongoDB
          </>
        )}
      </Button>

      {syncMessage && (
        <div className={`p-3 rounded-lg text-sm flex gap-2 items-start ${
          syncMessage.type === 'success'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {syncMessage.type === 'success' ? (
            <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{syncMessage.text}</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Localhost only - syncs local JSON to MongoDB
      </p>
    </div>
  );
}
