import { useState, useRef, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onEnd?: (finalTranscript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = options.continuous ?? false;
      recognition.interimResults = options.interimResults ?? true;
      recognition.lang = options.language || 'en-US'; // Use provided language or default to en-US

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + finalTranscript).trim();
        }

        const fullTranscript = finalTranscriptRef.current || interimTranscript;
        setTranscript(fullTranscript || interimTranscript);
        
        if (finalTranscript && options.onResult) {
          options.onResult(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        const errorMsg = event.error === 'no-speech' 
          ? 'No speech detected. Please try again.'
          : `Speech recognition error: ${event.error}`;
        
        if (options.onError) {
          options.onError(errorMsg);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Pass the final transcript to onEnd callback
        if (options.onEnd && finalTranscriptRef.current) {
          options.onEnd(finalTranscriptRef.current);
        }
        // Keep the transcript in state so it's available after recording stops
        // Don't clear finalTranscriptRef here - it will be cleared when starting a new recording
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [options.continuous, options.interimResults, options.language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      finalTranscriptRef.current = '';
      // Update language before starting
      if (options.language) {
        recognitionRef.current.lang = options.language;
      }
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const setLanguage = (lang: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  };

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    setLanguage,
  };
}
