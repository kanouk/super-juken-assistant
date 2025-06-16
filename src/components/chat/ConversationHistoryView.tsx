import React from "react";
import ChatHeader from "./ChatHeader";
import ConversationList from "./ConversationList";

interface ConversationHistoryViewProps {
  subject: string;
  subjectName: string;
  currentModel: string;
  onBackToList: () => void;
  isMobile: boolean;
  conversations: any[];
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewChat: () => void;
  onBackToWelcome?: () => void;
}

const ConversationHistoryView: React.FC<ConversationHistoryViewProps> = ({
  subject,
  subjectName,
  currentModel,
  onBackToList,
  isMobile,
  conversations,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
  onBackToWelcome,
}) => {
  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      <ChatHeader
        subject={subject}
        subjectName={`${subjectName} - 会話履歴`}
        onBack={onBackToList}
        onNewChat={onNewChat}
        messages={[]}
      />
      {/* 履歴リスト本体を、flex-1 min-h-0で高さを受け渡す */}
      <div className="flex-1 min-h-0">
        <ConversationList
          conversations={conversations}
          onSelectConversation={onSelectConversation}
          onDeleteConversation={onDeleteConversation}
          onNewChat={onNewChat}
        />
      </div>
    </div>
  );
};

export default ConversationHistoryView;
