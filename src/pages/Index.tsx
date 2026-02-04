import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { useChat } from '@/hooks/useChat';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { chatId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();
  
  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    createConversation,
    deleteConversation,
    isLoading,
    isLoadingChats,
    isLoadingChat,
  } = useChat(chatId, navigate);

  // Show loading state while chats are loading OR while a chat from URL is being loaded
  // Also show loading if we have a chatId in URL but no conversation yet (brief moment during load)
  const isInitialLoading = isLoadingChats || isLoadingChat || (chatId && !activeConversation && !isLoadingChats);

  if (isInitialLoading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <aside className="hidden h-full w-64 flex-shrink-0 border-r border-sidebar-border md:block p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </aside>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="text-sm text-muted-foreground">
              {isLoadingChats ? 'Loading conversations...' : 'Loading chat...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId || ''}
        onSelectConversation={setActiveConversationId}
        onNewConversation={createConversation}
        onDeleteConversation={deleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <ChatArea
        conversation={activeConversation}
        onSend={sendMessage}
        isLoading={isLoading}
        isLoadingChat={isLoadingChat}
        onMenuClick={() => setSidebarOpen(true)}
      />
    </div>
  );
};

export default Index;
