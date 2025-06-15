
import React from "react";
import { Button } from "@/components/ui/button";

interface SidebarSubjectButtonProps {
  id: string;
  name: string;
  Icon: React.ElementType;
  color: string;
  gradient: string;
  isSelected: boolean;
  onClick: (id: string) => void;
}

const SidebarSubjectButton: React.FC<SidebarSubjectButtonProps> = ({
  id,
  name,
  Icon,
  color,
  gradient,
  isSelected,
  onClick
}) => (
  <Button
    key={id}
    variant="ghost"
    className={`w-full justify-start h-auto p-4 transition-all duration-200 ${
      isSelected
        ? `bg-gradient-to-r ${gradient} text-white shadow-lg transform scale-105`
        : `${color} border border-transparent hover:border-gray-300 hover:shadow-md`
    }`}
    onClick={() => onClick(id)}
  >
    <div
      className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
        isSelected ? "bg-white/20" : "bg-white shadow-sm"
      }`}
    >
      <Icon className={`h-5 w-5 ${isSelected ? "text-white" : ""}`} />
    </div>
    <span className="font-medium text-sm">{name}</span>
    {isSelected && (
      <div className="ml-auto">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      </div>
    )}
  </Button>
);

export default SidebarSubjectButton;
