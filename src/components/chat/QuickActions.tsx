
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, RotateCcw, HelpCircle, Lightbulb } from "lucide-react";
import { Loader2 } from "lucide-react";

interface QuickActionsProps {
  onQuickAction: (prompt: string) => void;
  onUnderstood: () => void;
  isUnderstood?: boolean;
  disabled?: boolean;
  isTagging?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onQuickAction,
  onUnderstood,
  isUnderstood = false,
  disabled = false,
  isTagging = false
}) => {
  const quickActions = [
    {
      icon: RotateCcw,
      label: "もう一度説明して",
      prompt: "今の説明をもう少し詳しく、別の方法で説明してください。"
    },
    {
      icon: HelpCircle,
      label: "例題を出して",
      prompt: "この内容に関連する例題や練習問題を出してください。"
    },
    {
      icon: Lightbulb,
      label: "関連する内容を教えて",
      prompt: "この内容に関連する他の重要なポイントや応用例を教えてください。"
    }
  ];

  return (
    <Card className="shadow-sm border border-gray-100">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* 理解ボタン */}
          <div className="flex justify-center">
            <Button
              onClick={onUnderstood}
              disabled={disabled || isUnderstood || isTagging}
              className={`px-6 py-2 ${
                isUnderstood 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
              }`}
              size="sm"
            >
              {isTagging ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  タグ付け中...
                </>
              ) : isUnderstood ? (
                <>
                  <Heart className="h-4 w-4 mr-2 fill-current" />
                  理解済み
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  完全に理解した！
                </>
              )}
            </Button>
          </div>

          {/* クイックアクション */}
          {!isUnderstood && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onQuickAction(action.prompt)}
                  disabled={disabled || isTagging}
                  className="flex items-center justify-center text-xs py-2 px-3 h-auto border-gray-200 hover:bg-gray-50"
                >
                  <action.icon className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{action.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
