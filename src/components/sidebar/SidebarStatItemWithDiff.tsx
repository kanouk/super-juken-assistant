
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarStatItemWithDiffProps {
  label: string;
  value: number | string;
  diff?: number;
  isLoading?: boolean;
  icon: LucideIcon;
  iconColor: string;
}

const SidebarStatItemWithDiff: React.FC<SidebarStatItemWithDiffProps> = ({
  label,
  value,
  diff,
  isLoading,
  icon: Icon,
  iconColor
}) => {
  const getDiffDisplay = () => {
    if (diff === undefined || diff === 0) return null;
    
    const isPositive = diff > 0;
    const DiffIcon = isPositive ? TrendingUp : TrendingDown;
    const diffColor = isPositive ? 'text-green-600' : 'text-red-600';
    const prefix = isPositive ? '+' : '';
    
    return (
      <div className={`flex items-center text-xs ${diffColor} ml-2`}>
        <DiffIcon className="h-3 w-3 mr-1" />
        <span>{prefix}{diff}</span>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 rounded-md">
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <div className="flex items-center">
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <>
                <p className="text-lg font-bold text-gray-700">{value}</p>
                {getDiffDisplay()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarStatItemWithDiff;
