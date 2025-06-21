
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
  // Enhanced new chat handler - should close history view and start fresh chat
  const handleNewChat = () => {
    console.log('New chat from history view - closing history and starting fresh');
    // First trigger the new chat logic to reset all state
    onNewChat();
    // Then close the history view to return to main chat
    onBackToList();
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      <ChatHeader
        subject={subject}
        subjectName={`会話履歴`}
        onBack={onBackToList}
        onNewChat={handleNewChat}
        messages={[]}
      />
      {/* 履歴リスト本体を、flex-1 min-h-0で高さを受け渡す */}
      <div className="flex-1 min-h-0">
        <ConversationList
          conversations={conversations}
          onSelectConversation={onSelectConversation}
          onDeleteConversation={onDeleteConversation}
          onNewChat={handleNewChat}
        />
      </div>
    </div>
  );
};

export default ConversationHistoryView;
