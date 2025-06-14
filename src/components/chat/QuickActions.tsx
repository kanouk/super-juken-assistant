
import React from 'react';
import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, ThumbsUp, CheckCircle, Sparkles } from 'lucide-react';

interface QuickActionsProps {
  onQuickAction: (prompt: string) => void;
  onUnderstood: () => void;
  isUnderstood?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onQuickAction, onUnderstood, isUnderstood }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-start pl-11 pb-2 px-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onQuickAction('もっとわかりやすく教えてください')} 
        className="h-8 px-3 text-xs bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
      >
        <Brain className="mr-1.5 h-3 w-3" /> 
        <span className="hidden sm:inline">もっとわかりやすく</span>
        <span className="sm:hidden">簡単に</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onQuickAction('具体例をあげてください')} 
        className="h-8 px-3 text-xs bg-white border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 shadow-sm"
      >
        <Lightbulb className="mr-1.5 h-3 w-3" /> 
        <span className="hidden sm:inline">具体例を教えて</span>
        <span className="sm:hidden">具体例</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onUnderstood} 
        className={`h-8 px-3 text-xs transition-all duration-200 shadow-sm ${
          isUnderstood 
            ? 'bg-green-50 border-green-300 text-green-700' 
            : 'bg-white border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300'
        }`}
        disabled={isUnderstood}
      >
        {isUnderstood ? (
          <>
            <CheckCircle className="mr-1.5 h-3 w-3" />
            <span className="hidden sm:inline">理解済み！</span>
            <span className="sm:hidden">済み</span>
          </>
        ) : (
          <>
            <ThumbsUp className="mr-1.5 h-3 w-3" /> 
            <span className="hidden sm:inline">完全に理解した！</span>
            <span className="sm:hidden">理解！</span>
          </>
        )}
      </Button>
    </div>
  );
};

export default QuickActions;
