'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScheduleItem, calculateCategoryTotals, formatDuration, calculateDuration } from '@/lib/scheduleUtils';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SummaryProps {
  schedule: ScheduleItem[];
}

export function Summary({ schedule }: SummaryProps) {
  const totals = calculateCategoryTotals(schedule);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const displayCategories: Record<string, string> = {
    listening: 'Listening',
    reading: 'Reading',
    writing: 'Writing',
    speaking: 'Speaking',
    exercise: 'Exercise',
    work: 'Work',
    meal: 'Meals',
    break: 'Breaks',
    routine: 'Routine',
    reflection: 'Reflection',
  };

  const mainCategories = ['work'];
  const englishCategories = ['listening', 'reading', 'writing', 'speaking'];
  const otherCategories = ['exercise', 'break', 'routine', 'meal', 'reflection'];

  const toggleExpand = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryDetails = (category: string) => {
    return schedule
      .filter(item => item.type === category)
      .map(item => {
        const { hours, minutes } = calculateDuration(item.start, item.end);
        return {
          title: item.title,
          time: formatDuration(hours, minutes)
        };
      });
  };

  const renderCategoryGroup = (categories: string[], groupName?: string) => {
    const groupTotals = categories
      .map(cat => [cat, totals[cat]] as const)
      .filter(([_, dur]) => dur);

    if (groupTotals.length === 0) return null;

    return (
      <div key={groupName || 'other'} className="space-y-3">
        {groupName && (
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {groupName}
          </h3>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {groupTotals.map(([category, duration]) => {
            const isExpanded = expandedCategories.has(category);
            const details = getCategoryDetails(category);

            return (
              <div
                key={category}
                className="rounded-lg bg-background border border-border/50 hover:border-border transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground font-medium">
                        {displayCategories[category] || category}
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {formatDuration(duration.hours, duration.minutes)}
                      </p>
                    </div>
                    {details.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(category)}
                        className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {isExpanded && details.length > 0 && (
                  <div className="border-t border-border/50 bg-muted/30 p-3">
                    <div className="space-y-2 text-xs">
                      {details.map((detail, idx) => (
                        <div key={idx} className="flex justify-between items-start gap-2">
                          <span className="text-muted-foreground flex-1">{detail.title}</span>
                          <span className="font-mono font-medium text-foreground whitespace-nowrap">
                            {detail.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-background to-muted/30 border border-border">
      <div className="p-6 space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Daily Summary</h2>
        
        {renderCategoryGroup(mainCategories)}
        {renderCategoryGroup(englishCategories, 'English Learning')}
        {renderCategoryGroup(otherCategories, 'Others')}
      </div>
    </Card>
  );
}
