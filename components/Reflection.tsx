'use client';

import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useRef, useState } from 'react';

interface ReflectionProps {
  selectedDate: string;
}

export function Reflection({ selectedDate }: ReflectionProps) {
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    // Load reflection for the selected date
    const key = `reflection-${selectedDate}`;
    const saved = localStorage.getItem(key);
    setReflection(saved || '');
  }, [selectedDate]);

  const handleChange = (value: string) => {
    setReflection(value);
    const key = `reflection-${selectedDate}`;
    localStorage.setItem(key, value);
  };

  return (
    <Card className="bg-gradient-to-br from-background to-muted/30 border border-border">
      <div className="p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">Daily Reflection</h2>
        <Textarea
          placeholder={`Today I learned:
What I improved:
What to improve tomorrow:`}
          value={reflection}
          onChange={(e) => handleChange(e.target.value)}
          className="min-h-40 sm:min-h-48 text-base focus-visible:ring-1"
        />
      </div>
    </Card>
  );
}
