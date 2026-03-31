'use client';

import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { checkSpelling, SpellCheckError } from '@/lib/spellChecker';
import { Save, AlertCircle, AlertTriangle } from 'lucide-react';

interface ReflectionProps {
  selectedDate: string;
}

export function Reflection({ selectedDate }: ReflectionProps) {
  const [reflection, setReflection] = useState('');
  const [errors, setErrors] = useState<SpellCheckError[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Load reflection for the selected date
    const key = `reflection-${selectedDate}`;
    const saved = localStorage.getItem(key);
    setReflection(saved || '');
    setSaveMessage(null);
  }, [selectedDate]);

  const handleChange = (value: string) => {
    setReflection(value);
    const key = `reflection-${selectedDate}`;
    localStorage.setItem(key, value);
    
    // Run spell check
    const spellErrors = checkSpelling(value);
    setErrors(spellErrors);
  };

  const handleSave = async () => {
    if (!reflection.trim()) {
      setSaveMessage({ type: 'error', text: 'Reflection cannot be empty' });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateStr: selectedDate,
          reflection: reflection.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save reflection');
      }

      setSaveMessage({ type: 'success', text: 'Reflection saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save reflection:', error);
      setSaveMessage({ type: 'error', text: 'Failed to save reflection. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  return (
    <Card className="bg-gradient-to-br from-background to-muted/30 border border-border">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Daily Reflection</h2>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Reflection'}
          </Button>
        </div>

        {saveMessage && (
          <div className={`p-3 rounded-lg text-sm ${
            saveMessage.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {saveMessage.text}
          </div>
        )}

        <Textarea
          placeholder={`Today I learned:
What I improved:
What to improve tomorrow:`}
          value={reflection}
          onChange={(e) => handleChange(e.target.value)}
          className="min-h-40 sm:min-h-48 text-base focus-visible:ring-1"
        />

        {/* Spell Check Results */}
        {errors.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <AlertCircle className="h-4 w-4" />
              {errorCount > 0 && <span>{errorCount} error{errorCount !== 1 ? 's' : ''}</span>}
              {errorCount > 0 && warningCount > 0 && <span>,</span>}
              {warningCount > 0 && <span>{warningCount} warning{warningCount !== 1 ? 's' : ''}</span>}
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-background">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Word</th>
                    <th className="flex-1 px-4 py-3 text-left font-semibold text-foreground">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {errors.map((error, index) => (
                    <tr
                      key={index}
                      className={`border-b border-border ${
                        error.severity === 'error'
                          ? 'bg-red-50 dark:bg-red-900/10'
                          : 'bg-yellow-50 dark:bg-yellow-900/10'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {error.severity === 'error' ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="font-medium capitalize">
                            {error.severity === 'error' ? 'Error' : 'Warning'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                          {error.word}
                        </code>
                      </td>
                      <td className="flex-1 px-4 py-3 text-foreground">
                        <span className="capitalize">{error.type}</span>
                        {' - '}
                        {error.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
