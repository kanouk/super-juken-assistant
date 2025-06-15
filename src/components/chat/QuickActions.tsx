
import React from 'react';
import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, ThumbsUp, CheckCircle } from 'lucide-react';

interface QuickActionsProps {
  onQuickAction: (prompt: string) => void;
  onUnderstood: () => void;
  isUnderstood?: boolean;
  disabled?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  onQuickAction, 
  onUnderstood, 
  isUnderstood,
  disabled = false 
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onQuickAction('もっとわかりやすく教えてください')} 
        disabled={disabled}
        className="h-10 px-4 text-sm bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Brain className="mr-2 h-4 w-4" /> 
        <span className="hidden sm:inline">もっとわかりやすく</span>
        <span className="sm:hidden">簡単に</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onQuickAction('具体例をあげてください')} 
        disabled={disabled}
        className="h-10 px-4 text-sm bg-white border-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 hover:shadow-md transition-all duration-200 font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Lightbulb className="mr-2 h-4 w-4" /> 
        <span className="hidden sm:inline">具体例を教えて</span>
        <span className="sm:hidden">具体例</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onUnderstood} 
        className={`h-10 px-4 text-sm font-medium rounded-full transition-all duration-200 ${
          isUnderstood 
            ? 'bg-green-50 border-2 border-green-300 text-green-700 cursor-not-allowed opacity-75 shadow-inner' 
            : disabled
            ? 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
            : 'bg-white border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:shadow-md cursor-pointer'
        }`}
        disabled={isUnderstood || disabled}
      >
        {isUnderstood ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">理解済み！</span>
            <span className="sm:hidden">済み</span>
          </>
        ) : (
          <>
            <ThumbsUp className="mr-2 h-4 w-4" /> 
            <span className="hidden sm:inline">完全に理解した！</span>
            <span className="sm:hidden">理解！</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default QuickActions;
