'use client';

import { Question } from '@/lib/types';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: string;
  onAnswer: (answer: string) => void;
  isMarked: boolean;
  onToggleMark: () => void;
}

export function QuestionCard({
  question,
  selectedAnswer,
  onAnswer,
  isMarked,
  onToggleMark,
}: QuestionCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg text-white font-medium leading-relaxed">
            {question.text}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMark}
          className={cn(
            'shrink-0',
            isMarked ? 'text-yellow-500 hover:text-yellow-400' : 'text-slate-400 hover:text-slate-300'
          )}
        >
          <Bookmark className={cn('w-5 h-5', isMarked && 'fill-current')} />
        </Button>
      </div>

      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onAnswer(option.id)}
              className={cn(
                'w-full text-left border rounded-lg p-4 transition-all cursor-pointer',
                'bg-slate-800/50 border-slate-700 hover:border-indigo-500/50',
                isSelected && 'border-indigo-500 bg-indigo-500/10'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 transition-all',
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-slate-600'
                  )}
                >
                  {isSelected && (
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
                <span className="text-slate-200">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
