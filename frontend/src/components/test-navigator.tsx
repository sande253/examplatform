'use client';

import { TestAttemptQuestion } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TestNavigatorProps {
  questions: TestAttemptQuestion[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function TestNavigator({ questions, currentIndex, onNavigate }: TestNavigatorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ANSWERED':
        return 'bg-indigo-600 hover:bg-indigo-500 text-white';
      case 'MARKED':
        return 'bg-yellow-500 hover:bg-yellow-400 text-black';
      default:
        return 'bg-slate-700 hover:bg-slate-600 text-slate-300';
    }
  };

  const counts = {
    answered: questions.filter((q) => q.status === 'ANSWERED').length,
    marked: questions.filter((q) => q.status === 'MARKED').length,
    unanswered: questions.filter((q) => q.status === 'UNANSWERED').length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        {questions.map((question, index) => (
          <button
            key={question.id}
            onClick={() => onNavigate(index)}
            className={cn(
              'aspect-square rounded-lg font-semibold text-sm transition-all',
              getStatusColor(question.status),
              currentIndex === index && 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="space-y-2 text-sm">
        <div className="text-slate-400 font-medium mb-3">Legend</div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-indigo-600"></div>
          <span className="text-slate-300">Answered ({counts.answered})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-yellow-500"></div>
          <span className="text-slate-300">Marked ({counts.marked})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-slate-700"></div>
          <span className="text-slate-300">Unanswered ({counts.unanswered})</span>
        </div>
      </div>
    </div>
  );
}
