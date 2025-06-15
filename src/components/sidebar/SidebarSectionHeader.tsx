
import React from "react";

interface SidebarSectionHeaderProps {
  title: string;
  icon: React.ElementType;
  iconBgColor: string;
  isOpen: boolean;
  UpIcon?: React.ElementType;
  DownIcon?: React.ElementType;
}

const SidebarSectionHeader: React.FC<SidebarSectionHeaderProps> = ({
  title,
  icon: IconComponent,
  iconBgColor,
  isOpen,
  UpIcon,
  DownIcon,
}) => (
  <div className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-center space-x-2">
      <div className={`p-1 ${iconBgColor} rounded-lg`}>
        <IconComponent className="h-4 w-4 text-white" />
      </div>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    {isOpen
      ? UpIcon
        ? <UpIcon className="h-4 w-4 text-gray-500" />
        : null
      : DownIcon
        ? <DownIcon className="h-4 w-4 text-gray-500" />
        : null
    }
  </div>
);

export default SidebarSectionHeader;
