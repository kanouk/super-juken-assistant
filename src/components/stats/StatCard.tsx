
import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number | string;
  diff?: number;
  isLoading?: boolean;
  icon: LucideIcon;
  iconColor: string;
  cardColor: string;
  borderColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  diff,
  isLoading,
  icon: Icon,
  iconColor,
  cardColor,
  borderColor
}) => {
  const getDiffDisplay = () => {
    if (diff === undefined || diff === null) return null;
    
    if (diff === 0) {
      return (
        <div className="flex items-center text-xs text-gray-500 ml-2">
          <span>±0</span>
        </div>
      );
    }
    
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
    <Card className={`${cardColor} ${borderColor} cursor-help`}>
      <CardContent className="p-4 text-center">
        <Icon className={`h-8 w-8 ${iconColor} mx-auto mb-2`} />
        <div className="flex items-center justify-center">
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              <p className={`text-2xl font-bold ${iconColor.replace('text-', 'text-').replace('-600', '-800')}`}>
                {value}
              </p>
              {getDiffDisplay()}
            </>
          )}
        </div>
        <p className={`text-sm ${iconColor}`}>{title}</p>
      </CardContent>
    </Card>
  );
};

export default StatCard;
