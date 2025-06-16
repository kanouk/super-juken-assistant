
import React from 'react';
import { BookOpen, ChevronUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import SidebarSectionHeader from "./SidebarSectionHeader";
import SidebarSubjectButton from "./SidebarSubjectButton";

interface SidebarSubjectsSectionProps {
  displaySubjects: any[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubjectSelect: (subject: string) => void;
}

const SidebarSubjectsSection: React.FC<SidebarSubjectsSectionProps> = ({
  displaySubjects,
  isOpen,
  onOpenChange,
  onSubjectSelect
}) => {
  const CollapsibleSectionHeader = (props: any) => (
    <SidebarSectionHeader
      {...props}
      UpIcon={ChevronUp}
      DownIcon={ChevronDown}
    />
  );

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="w-full">
        <CollapsibleSectionHeader 
          title="教科選択" 
          icon={BookOpen} 
          iconBgColor="bg-gradient-to-r from-blue-500 to-indigo-600" 
          isOpen={isOpen} 
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-2">
        {displaySubjects.map((subjectItem) => (
          <SidebarSubjectButton
            key={subjectItem.id}
            id={subjectItem.id}
            name={subjectItem.name}
            Icon={subjectItem.icon}
            color={subjectItem.color}
            gradient={subjectItem.gradient}
            isSelected={false}
            onClick={onSubjectSelect}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SidebarSubjectsSection;
