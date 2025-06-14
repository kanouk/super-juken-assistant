
import React from 'react';
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, ThumbsUp, CheckCircle } from 'lucide-react';

interface QuickActionsProps {
  onQuickAction: (prompt: string) => void;
  onUnderstood: () => void;
  isUnderstood: boolean | undefined;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onQuickAction, onUnderstood, isUnderstood }) => {
  return (
    <div className="mt-2 flex flex-wrap gap-2 justify-start pl-11 pb-2">
      <Button variant="outline" size="sm" onClick={() => onQuickAction('もっとわかりやすく教えてください')} className="text-xs">
        <Brain className="mr-1 h-3 w-3" /> もっとわかりやすく
      </Button>
      <Button variant="outline" size="sm" onClick={() => onQuickAction('具体例をあげてください')} className="text-xs">
        <Sparkles className="mr-1 h-3 w-3" /> 具体例を教えて
      </Button>
      <Button variant="outline" size="sm" onClick={onUnderstood} className="text-xs">
        <ThumbsUp className="mr-1 h-3 w-3" /> 完全に理解した！
        {isUnderstood && <CheckCircle className="ml-1 h-3 w-3 text-green-500" />}
      </Button>
    </div>
  );
};

export default QuickActions;
