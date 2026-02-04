import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Paperclip, Mic, Square, Languages } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SPEECH_LANGUAGES, DEFAULT_LANGUAGE, getLanguageName } from '@/utils/speechLanguages';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const STORAGE_KEY = 'speech-recognition-language';

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  // Get language from localStorage or use default
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored || DEFAULT_LANGUAGE;
    }
    return DEFAULT_LANGUAGE;
  });

  const {
    isListening,
    transcript,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    onResult: (finalTranscript) => {
      if (finalTranscript) {
        setMessage(finalTranscript);
      }
    },
    onEnd: (finalTranscript) => {
      // When recording ends, just update the message - don't auto-send
      // User can review and edit before sending
      if (finalTranscript.trim()) {
        setMessage(finalTranscript.trim());
      }
    },
    onError: (error) => {
      toast({
        title: 'Speech Recognition Error',
        description: error,
        variant: 'destructive',
      });
    },
    continuous: false,
    interimResults: true,
    language: selectedLanguage,
  });

  // Save language preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, selectedLanguage);
    }
  }, [selectedLanguage]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Update message when transcript changes (for interim results during recording)
  useEffect(() => {
    if (isListening && transcript) {
      setMessage(transcript);
    }
  }, [transcript, isListening]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMicClick = () => {
    if (!isSpeechSupported) {
      toast({
        title: 'Not Supported',
        description: 'Speech recognition is not supported in your browser',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      stopListening();
      // The onEnd callback will handle sending the message
    } else {
      setMessage('');
      startListening();
    }
  };

  return (
    <div className="border-t border-border/50 bg-background px-4 pb-6 pt-4 md:px-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl"
      >
        <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg transition-all focus-within:border-primary/50 focus-within:shadow-xl focus-within:shadow-primary/10 pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Attach file</span>
          </Button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Message..."}
            disabled={isLoading}
            readOnly={isListening}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none",
              "max-h-[200px] min-h-[40px]",
              isListening && "placeholder:text-primary",
              isListening && "cursor-not-allowed"
            )}
          />

          <div className="flex items-center gap-1">
            {/* Language Selector - Only show when not recording */}
            {!isListening && isSpeechSupported && (
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger
                  className={cn(
                    "h-9 w-auto min-w-[90px] max-w-[120px] px-2 text-xs gap-1.5",
                    "border-border bg-background hover:bg-accent"
                  )}
                  title={`Language: ${getLanguageName(selectedLanguage)}`}
                >
                  <Languages className="h-3 w-3 flex-shrink-0" />
                  <SelectValue className="truncate">
                    <span className="truncate">
                      {getLanguageName(selectedLanguage).split(' ')[0]}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[400px] w-[280px]">
                  {SPEECH_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="py-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{lang.name}</span>
                        {lang.nativeName && lang.nativeName !== lang.name && (
                          <span className="text-xs text-muted-foreground">{lang.nativeName}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Record Button - Toggle recording */}
            <Button
              variant={isListening ? "destructive" : "ghost"}
              size="icon"
              onClick={handleMicClick}
              disabled={isLoading}
              className={cn(
                "h-9 w-9 flex-shrink-0 rounded-lg transition-all",
                isListening && "animate-pulse"
              )}
              title={isListening ? "Stop recording" : `Start recording (${getLanguageName(selectedLanguage)})`}
            >
              {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="sr-only">{isListening ? "Stop recording" : "Start recording"}</span>
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={(!message.trim() && !isListening) || isLoading}
              size="icon"
              className={cn(
                "h-9 w-9 flex-shrink-0 rounded-lg transition-all duration-200",
                (message.trim() || isListening)
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
        
        <p className="mt-3 text-center text-xs text-muted-foreground/50">
          AI may produce inaccurate information. Consider verifying important details.
        </p>
      </motion.div>
    </div>
  );
}
