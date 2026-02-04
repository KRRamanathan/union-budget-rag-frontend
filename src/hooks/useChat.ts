import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message, Conversation } from '@/types/chat';
import { chatService, ChatSession, ChatMessage as ApiChatMessage } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';

const createConversationFromApi = (session: ChatSession): Conversation => {
  const messages: Message[] = (session.messages || []).map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.created_at),
    sources: msg.sources,
  }));

  return {
    id: session.id,
    title: session.title || 'New conversation',
    messages,
    createdAt: new Date(session.created_at),
    updatedAt: new Date(session.created_at),
  };
};

export function useChat(chatIdFromUrl?: string, navigate?: ReturnType<typeof useNavigate>) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const { toast } = useToast();
  const internalNavigate = useNavigate();
  
  // Refs to prevent infinite loops
  const isUpdatingUrlRef = useRef(false);
  const isSyncingFromUrlRef = useRef(false);

  // Use provided navigate or internal one
  const nav = navigate || internalNavigate;

  // Update URL when active conversation changes (but not when syncing from URL)
  useEffect(() => {
    if (isSyncingFromUrlRef.current) return; // Don't update URL if we're syncing from URL
    
    if (activeConversationId) {
      const currentPath = window.location.pathname;
      const newPath = `/chat/${activeConversationId}`;
      if (currentPath !== newPath) {
        isUpdatingUrlRef.current = true;
        nav(newPath, { replace: true });
        // Reset flag after navigation
        setTimeout(() => {
          isUpdatingUrlRef.current = false;
        }, 100);
      }
    } else {
      // No active conversation, navigate to home
      const currentPath = window.location.pathname;
      if (currentPath !== '/') {
        isUpdatingUrlRef.current = true;
        nav('/', { replace: true });
        setTimeout(() => {
          isUpdatingUrlRef.current = false;
        }, 100);
      }
    }
  }, [activeConversationId, nav]);

  const loadChat = useCallback(async (chatId: string) => {
    try {
      const response = await chatService.getChat(chatId);
      return createConversationFromApi(response);
    } catch (error) {
      console.error('Failed to load chat:', error);
      throw error;
    }
  }, []);

  // Helper to load chat from URL - defined before useEffects that use it
  const loadChatFromUrl = useCallback(async (id: string): Promise<void> => {
    if (id === activeConversationId) return;
    
    const previousId = activeConversationId;
    isSyncingFromUrlRef.current = true;
    setActiveConversationId(id);
    setIsLoadingChat(true);
    
    try {
      const chat = await loadChat(id);
      setConversations(prev => {
        const existing = prev.find(c => c.id === id);
        if (existing) {
          return prev.map(conv => (conv.id === id ? chat : conv));
        } else {
          return [chat, ...prev];
        }
      });
      // Reset syncing flag after successful load
      setTimeout(() => {
        isSyncingFromUrlRef.current = false;
      }, 100);
    } catch (error) {
      console.error('Failed to load chat from URL:', error);
      // Revert active conversation
      if (previousId) {
        setActiveConversationId(previousId);
      } else {
        setActiveConversationId(null);
      }
      // Reset syncing flag
      setTimeout(() => {
        isSyncingFromUrlRef.current = false;
      }, 100);
      // Re-throw error so caller can handle it
      throw error;
    } finally {
      setIsLoadingChat(false);
    }
  }, [activeConversationId, loadChat]);

  // Load chats on mount and sync with URL
  useEffect(() => {
    loadChats();
  }, []);

  // Sync with URL chatId when it changes (after chats are loaded)
  useEffect(() => {
    if (isLoadingChats || isUpdatingUrlRef.current || isSyncingFromUrlRef.current) {
      return; // Wait for chats to load or URL update to complete
    }
    
    if (chatIdFromUrl && chatIdFromUrl !== activeConversationId) {
      // URL has a different chatId, try to load it
      // First check if it's already in conversations (quick path)
      const chatExists = conversations.find(c => c.id === chatIdFromUrl);
      if (chatExists) {
        // Chat exists in list, just load it (this updates it with full data)
        loadChatFromUrl(chatIdFromUrl).catch((error) => {
          console.error('Failed to load existing chat:', error);
          toast({
            title: 'Error',
            description: 'Failed to load conversation',
            variant: 'destructive',
          });
        });
      } else {
        // Chat not in list, but try to load it directly from API
        // This handles cases where user navigates directly to a URL
        // Set loading state immediately
        setIsLoadingChat(true);
        loadChatFromUrl(chatIdFromUrl).catch((error) => {
          // If chat doesn't exist (404), navigate to home
          console.error('Chat not found from URL:', error);
          setIsLoadingChat(false);
          toast({
            title: 'Chat not found',
            description: 'The requested chat could not be found',
            variant: 'destructive',
          });
          nav('/', { replace: true });
        });
      }
    } else if (!chatIdFromUrl && activeConversationId && !isUpdatingUrlRef.current) {
      // If URL has no chatId but we have an active conversation, update URL
      // But only if we're not already updating the URL
      isUpdatingUrlRef.current = true;
      nav(`/chat/${activeConversationId}`, { replace: true });
      setTimeout(() => {
        isUpdatingUrlRef.current = false;
      }, 100);
    }
  }, [chatIdFromUrl, activeConversationId, isLoadingChats, nav, conversations, loadChatFromUrl, toast]);

  const loadChats = async () => {
    try {
      setIsLoadingChats(true);
      const response = await chatService.listChats();
      const convs = response.chats.map(createConversationFromApi);
      setConversations(convs);
      
      // If URL has a chatId, check if it exists in the list
      // But don't navigate away yet - let the URL sync effect handle loading it
      // This allows direct URL navigation to work even if chat isn't in the list
      if (chatIdFromUrl) {
        const chatExists = convs.find(c => c.id === chatIdFromUrl);
        if (chatExists) {
          // Chat exists in list, set it as active
          setActiveConversationId(chatIdFromUrl);
        }
        // If chat doesn't exist in list, the URL sync effect will try to load it directly
        // and handle navigation if it truly doesn't exist
      }
      // Don't auto-select first chat - let user choose or create new one by sending first message
    } catch (error) {
      console.error('Failed to load chats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingChats(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    let currentChatId = activeConversationId;
    const userMessageId = `temp-${Date.now()}`;
    
    // Create user message object
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    // Create new chat session only when sending the first message
    if (!currentChatId) {
      try {
        // Create chat first
        const response = await chatService.createChat();
        currentChatId = response.chat_id;
        
        // Create conversation with user message already added
        const newConv: Conversation = {
          id: currentChatId,
          title: null,
          messages: [userMessage],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Update state immediately so UI switches to chat view with message visible
        setConversations(prev => [newConv, ...prev]);
        setActiveConversationId(currentChatId);
        
        // Ensure URL updates
        isSyncingFromUrlRef.current = true;
        nav(`/chat/${currentChatId}`, { replace: true });
        setTimeout(() => {
          isSyncingFromUrlRef.current = false;
        }, 100);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create chat',
          variant: 'destructive',
        });
        return;
      }
    } else {
      // Add user message optimistically for existing chat
    setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === currentChatId) {
          return {
            ...conv,
            messages: [...conv.messages, userMessage],
            updatedAt: new Date(),
          };
        }
        return conv;
      });
    });
    }

    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(currentChatId, content.trim());
      
      const assistantMessage: Message = {
        id: response.message_id,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources,
      };

      // Reload the chat to get updated title and all messages
      const updatedChat = await loadChat(currentChatId);

      setConversations(prev => {
        const existing = prev.find(c => c.id === currentChatId);
        if (existing) {
          return prev.map(conv => {
            if (conv.id === currentChatId) {
              return updatedChat;
            }
            return conv;
          });
        } else {
          return [updatedChat, ...prev];
        }
      });
    } catch (error) {
      // Remove optimistic user message on error
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === currentChatId) {
            return {
              ...conv,
              messages: conv.messages.filter(m => m.id !== userMessageId),
            };
          }
          return conv;
        });
      });

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, isLoading, toast, nav]);

  const createConversation = useCallback(() => {
    // Just clear the active conversation - session will be created when first message is sent
    isSyncingFromUrlRef.current = true;
    setActiveConversationId(null);
    nav('/', { replace: true });
    setTimeout(() => {
      isSyncingFromUrlRef.current = false;
    }, 100);
  }, [nav]);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await chatService.deleteChat(id);
      
      // Handle active conversation deletion before updating state
      const wasActive = activeConversationId === id;
      
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
        
        // Handle active conversation deletion
        if (wasActive) {
      if (updated.length === 0) {
            // No chats left, clear active and navigate to home
            isSyncingFromUrlRef.current = true;
            setActiveConversationId(null);
            nav('/', { replace: true });
            setTimeout(() => {
              isSyncingFromUrlRef.current = false;
            }, 100);
          } else {
            // Switch to first remaining chat
            isSyncingFromUrlRef.current = true;
        setActiveConversationId(updated[0].id);
            setTimeout(() => {
              isSyncingFromUrlRef.current = false;
            }, 100);
          }
      }
        
      return updated;
    });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete conversation',
        variant: 'destructive',
      });
    }
  }, [activeConversationId, nav, toast]);

  const selectConversation = useCallback(async (id: string) => {
    if (id === activeConversationId) return;

    // Capture previous ID before changing
    const previousId = activeConversationId;
    
    // Set active immediately for better UX
    setActiveConversationId(id);
    setIsLoadingChat(true);
    
    try {
      // Always load the full chat to ensure we have the latest messages
      const chat = await loadChat(id);
      setConversations(prev => {
        const existing = prev.find(c => c.id === id);
        if (existing) {
          // Update existing conversation with full data
          return prev.map(conv => {
            if (conv.id === id) {
              return chat;
            }
            return conv;
          });
        } else {
          // Add new conversation if not in list
          return [chat, ...prev];
        }
      });
      // URL will be updated by the useEffect that watches activeConversationId
    } catch (error) {
      console.error('Failed to load chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation',
        variant: 'destructive',
      });
      // Revert to previous active conversation on error
      if (previousId) {
        setActiveConversationId(previousId);
      } else {
        // If no previous, navigate to home
        nav('/', { replace: true });
      }
    } finally {
      setIsLoadingChat(false);
    }
  }, [activeConversationId, toast, nav]);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId: selectConversation,
    sendMessage,
    createConversation,
    deleteConversation,
    isLoading,
    isLoadingChats,
    isLoadingChat,
    refreshChats: loadChats,
  };
}
