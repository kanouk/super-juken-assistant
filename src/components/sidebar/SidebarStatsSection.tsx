
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarStatsSectionProps {
  dailyQuestions: number;
  understoodCount: number;
  totalQuestions: number;
  questionsDiff: number;
  understoodDiff: number;
  isStatsLoading: boolean;
}

const SidebarStatsSection: React.FC<SidebarStatsSectionProps> = ({
  dailyQuestions,
  understoodCount,
  totalQuestions,
  questionsDiff,
  understoodDiff,
  isStatsLoading
}) => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <BarChart3 className="h-4 w-4 text-emerald-600" />
        <h3 className="font-semibold text-gray-800">今日の学習</h3>
      </div>
      
      {isStatsLoading ? (
        <div className="space-y-2">
          <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          <div className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">質問数</p>
                  <p className="text-2xl font-bold text-blue-800">{dailyQuestions}</p>
                </div>
                <div className="text-right">
                  <span className={cn("text-sm font-medium", questionsDiff >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {questionsDiff >= 0 ? `+${questionsDiff}` : questionsDiff}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700 font-medium">理解度</p>
                  <p className="text-2xl font-bold text-emerald-800">{understoodCount}</p>
                </div>
                <div className="text-right">
                  <span className={cn("text-sm font-medium", understoodDiff >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {understoodDiff >= 0 ? `+${understoodDiff}` : understoodDiff}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">累計質問</p>
                  <p className="text-2xl font-bold text-purple-800">{totalQuestions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SidebarStatsSection;
