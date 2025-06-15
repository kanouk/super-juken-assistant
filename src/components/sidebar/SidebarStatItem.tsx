
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import React from "react";

interface SidebarStatItemProps {
  label: string;
  value: number | string;
  unit?: string;
  isLoading: boolean;
  icon: React.ElementType;
  iconColor: string;
}

const SidebarStatItem: React.FC<SidebarStatItemProps> = ({
  label,
  value,
  unit,
  isLoading,
  icon: Icon,
  iconColor,
}) => (
  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
    <div className="flex items-center space-x-2">
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <span className="text-sm text-gray-700 font-medium">{label}</span>
    </div>
    {isLoading ? (
      <Skeleton className="h-5 w-12" />
    ) : (
      <Badge variant="secondary" className="font-semibold">
        {value}
        {unit}
      </Badge>
    )}
  </div>
);

export default SidebarStatItem;
