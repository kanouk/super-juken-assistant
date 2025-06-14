
import React from "react";
import ChatHeader from "./ChatHeader";
import ConversationList from "./ConversationList";

interface ConversationHistoryViewProps {
  subject: string;
  subjectName: string;
  currentModel: string;
  modelOptions: { label: string; value: string }[];
  onModelChange?: (model: string) => void;
  onBackToList: () => void;
  onToggleSidebar: () => void;
  isMobile: boolean;
  conversations: any[];
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewChat: () => void;
}

const ConversationHistoryView: React.FC<ConversationHistoryViewProps> = ({
  subject,
  subjectName,
  currentModel,
  modelOptions,
  onModelChange,
  onBackToList,
  onToggleSidebar,
  isMobile,
  conversations,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <ChatHeader
        subjectName={`${subjectName} - 会話履歴`}
        currentModel={currentModel}
        modelOptions={modelOptions}
        onModelChange={onModelChange}
        currentSubjectId={subject}
        onBackToList={onBackToList}
        showBackButton={true}
        onToggleSidebar={onToggleSidebar}
        isMobile={isMobile}
      />
      <ConversationList
        conversations={conversations}
        onSelectConversation={onSelectConversation}
        onDeleteConversation={onDeleteConversation}
        onNewChat={onNewChat}
      />
    </div>
  );
};

export default ConversationHistoryView;
