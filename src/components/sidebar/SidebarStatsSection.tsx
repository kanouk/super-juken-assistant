
import React from 'react';
import { TrendingUp, ChevronUp, ChevronDown, CheckCircle, User, Sparkles, RefreshCw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserProfile } from '@/types/profile';
import SidebarSectionHeader from "./SidebarSectionHeader";
import SidebarStatItem from "./SidebarStatItem";
import SidebarStatItemWithDiff from "./SidebarStatItemWithDiff";

interface SidebarStatsSectionProps {
  profile: UserProfile | null;
  dailyQuestions: number;
  understoodCount: number;
  questionsDiff: number;
  understoodDiff: number;
  isStatsLoading: boolean;
  displaySubjects: any[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const SidebarStatsSection: React.FC<SidebarStatsSectionProps> = ({
  profile,
  dailyQuestions,
  understoodCount,
  questionsDiff,
  understoodDiff,
  isStatsLoading,
  displaySubjects,
  isOpen,
  onOpenChange
}) => {
  const CollapsibleSectionHeader = (props: any) => (
    <SidebarSectionHeader
      {...props}
      UpIcon={ChevronUp}
      DownIcon={ChevronDown}
    />
  );

  const getUnderstoodBySubject = () => {
    const subjectCounts: Record<string, number> = {};
    displaySubjects.forEach(subject => {
      subjectCounts[subject.name] = Math.floor(Math.random() * 5);
    });
    return subjectCounts;
  };

  const understoodBySubject = getUnderstoodBySubject();

  if (!profile?.show_stats) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="w-full">
        <CollapsibleSectionHeader 
          title="学習統計" 
          icon={TrendingUp} 
          iconBgColor="bg-gradient-to-r from-green-500 to-emerald-600" 
          isOpen={isOpen} 
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                <SidebarStatItemWithDiff 
                  label="本日理解した数" 
                  value={understoodCount}
                  diff={understoodDiff}
                  isLoading={isStatsLoading}
                  icon={CheckCircle}
                  iconColor="text-green-600"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">教科別本日理解数：</p>
                {Object.entries(understoodBySubject).length > 0 ? (
                  Object.entries(understoodBySubject).map(([subject, count]) => (
                    <p key={subject} className="text-sm">{subject}: {String(count)}個</p>
                  ))
                ) : (
                  <p className="text-sm">まだ理解した内容がありません</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <SidebarStatItemWithDiff 
          label="本日の質問数" 
          value={dailyQuestions} 
          diff={questionsDiff}
          isLoading={isStatsLoading}
          icon={User}
          iconColor="text-blue-600"
        />
        <SidebarStatItem 
          label="本日のコスト" 
          value={`¥0.00`}
          isLoading={isStatsLoading}
          icon={Sparkles}
          iconColor="text-purple-600"
        />
        <SidebarStatItem 
          label="累計コスト" 
          value={`¥0.00`}
          isLoading={isStatsLoading}
          icon={RefreshCw}
          iconColor="text-orange-600"
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SidebarStatsSection;
