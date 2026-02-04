import { useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Conversation } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { StatusIndicator } from './StatusIndicator';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatAreaProps {
  conversation: Conversation | undefined;
  onSend: (message: string) => void;
  isLoading: boolean;
  isLoadingChat?: boolean;
  onMenuClick: () => void;
}

export function ChatArea({ conversation, onSend, isLoading, isLoadingChat = false, onMenuClick }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, isLoading]);

  const hasMessages = conversation && conversation.messages.length > 0;

  // Show loading state when switching chats
  if (isLoadingChat && !conversation) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingChat && conversation) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-4xl w-full px-4 py-6 md:px-8 space-y-4">
            {conversation.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div className="flex items-center justify-center py-4">
              <div className="text-center space-y-2">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                <p className="text-xs text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          </div>
        </div>
        <ChatInput onSend={onSend} isLoading={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header - only show when there are messages */}
      {hasMessages && (
        <header className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="h-9 w-9 rounded-lg md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-sm font-medium truncate max-w-[200px] md:max-w-none">
              {conversation?.title || 'New conversation'}
            </h2>
          </div>
        </header>
      )}
      
      {/* Mobile menu button when no messages */}
      {!hasMessages && (
        <div className="absolute left-4 top-4 z-10 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-9 w-9 rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}


      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin relative">
        {hasMessages ? (
          <div className="mx-auto max-w-4xl w-full">
            {conversation.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="px-4 py-6 md:px-8">
                <StatusIndicator isLoading={isLoading} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <EmptyState onSuggestionClick={onSend} />
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} isLoading={isLoading} />
    </div>
  );
}
