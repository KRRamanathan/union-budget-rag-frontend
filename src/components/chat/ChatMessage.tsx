import { motion } from 'framer-motion';
import { User, Copy, Check, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MarkdownContent } from './MarkdownContent';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { detectLanguageForTTS } from '@/utils/languageDetection';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeakingThis, setIsSpeakingThis] = useState(false);
  const isUser = message.role === 'user';
  
  const { speak, stop, isSpeaking, isSupported: isTtsSupported } = useSpeechSynthesis({
    onEnd: () => {
      setIsSpeakingThis(false);
    },
    onError: () => {
      setIsSpeakingThis(false);
    },
  });

  // Sync speaking state
  useEffect(() => {
    if (!isSpeaking && isSpeakingThis) {
      setIsSpeakingThis(false);
    }
  }, [isSpeaking, isSpeakingThis]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeakingThis) {
      stop();
      setIsSpeakingThis(false);
    } else {
      // Stop any other speaking (this will stop any other message that's speaking)
      stop();
      setIsSpeakingThis(true);
      
      // Detect language FIRST from original content (before cleaning)
      const detectedLang = detectLanguageForTTS(message.content);
      
      // Clean the text for TTS (remove markdown formatting)
      // But preserve non-English characters
      const cleanText = message.content
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/`(.*?)`/g, '$1') // Remove code
        .replace(/#{1,6}\s/g, '') // Remove headers
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      if (cleanText) {
        // Use detected language for TTS
        speak(cleanText, detectedLang);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group flex gap-4 px-4 py-6 md:px-8",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
      <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted border border-border overflow-hidden">
            <img
              src="/nirmala-sitharaman.png"
              alt="Nirmala Sitharaman"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}
      
      <div className={cn(
        "flex flex-col space-y-2 overflow-hidden",
        isUser ? "items-end max-w-[85%] md:max-w-[70%]" : "items-start max-w-[85%] md:max-w-[70%]"
      )}>
        {!isUser && (
          <span className="text-xs font-medium text-muted-foreground">
            Assistant
          </span>
        )}
        
        <div className={cn(
          "rounded-2xl px-4 py-3",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-foreground"
        )}>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed text-sm">
                {message.content}
              </p>
            ) : (
              <div className="text-sm leading-relaxed">
                <MarkdownContent content={message.content} />
              </div>
            )}
          </div>
        </div>
        
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {message.sources.map((source, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 rounded-md bg-muted/50 text-muted-foreground border border-border"
              >
                {source.doc_name} (p. {source.page_number})
              </span>
            ))}
          </div>
        )}
        
        {!isUser && (
          <div className="flex items-center gap-2 pt-1 opacity-0 transition-opacity group-hover:opacity-100">
            {isTtsSupported && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSpeak}
                className={cn(
                  "h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2",
                  isSpeakingThis && "text-primary"
                )}
              >
                {isSpeakingThis ? (
                  <>
                    <VolumeX className="h-3 w-3" />
                    Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3 w-3" />
                    Speak
                  </>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
        </div>
      )}
    </motion.div>
  );
}
