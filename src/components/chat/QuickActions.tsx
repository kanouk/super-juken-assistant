
import React from 'react';
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, ThumbsUp, CheckCircle } from 'lucide-react';

interface QuickActionsProps {
  onQuickAction: (prompt: string) => void;
  onUnderstood: () => void;
  isUnderstood?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onQuickAction, onUnderstood, isUnderstood }) => {
  return (
    <div className="mt-2 flex flex-wrap gap-1 lg:gap-2 justify-start pl-9 lg:pl-11 pb-2 px-3 lg:px-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onQuickAction('もっとわかりやすく教えてください')} 
        className="text-xs h-7 px-2 lg:px-3"
      >
        <Brain className="mr-1 h-3 w-3" /> 
        <span className="hidden sm:inline">もっとわかりやすく</span>
        <span className="sm:hidden">簡単に</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onQuickAction('具体例をあげてください')} 
        className="text-xs h-7 px-2 lg:px-3"
      >
        <Sparkles className="mr-1 h-3 w-3" /> 
        <span className="hidden sm:inline">具体例を教えて</span>
        <span className="sm:hidden">具体例</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onUnderstood} 
        className="text-xs h-7 px-2 lg:px-3"
      >
        <ThumbsUp className="mr-1 h-3 w-3" /> 
        <span className="hidden sm:inline">完全に理解した！</span>
        <span className="sm:hidden">理解！</span>
        {isUnderstood && <CheckCircle className="ml-1 h-3 w-3 text-green-500" />}
      </Button>
    </div>
  );
};

export default QuickActions;
