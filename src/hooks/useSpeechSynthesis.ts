import { useState, useRef, useEffect } from 'react';

interface UseSpeechSynthesisOptions {
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
    
    // Load voices (some browsers need this)
    if ('speechSynthesis' in window) {
      // Chrome needs voices to be loaded
      const loadVoices = () => {
        // Voices loaded - they're now available for selection
        window.speechSynthesis.getVoices();
      };
      
      loadVoices();
      // Some browsers load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
    
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = (text: string, lang: string = 'en-US') => {
    if (!isSupported) {
      if (options.onError) {
        options.onError('Speech synthesis is not supported in this browser');
      }
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Check if a voice is available for the requested language
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = lang.split('-')[0]; // e.g., 'ta' from 'ta-IN'
    
    // Try to find a voice for the requested language
    let selectedVoice = voices.find(voice => 
      voice.lang.startsWith(langPrefix) || voice.lang === lang
    );
    
    // If no exact match, try to find any voice with the language prefix
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang.toLowerCase().includes(langPrefix.toLowerCase())
      );
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language - this is critical for TTS to work in the right language
    utterance.lang = lang;
    
    // Set voice if found (helps with better pronunciation)
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    // Even if no specific voice is found, the lang property should help
    // the browser use an appropriate voice or attempt pronunciation
    
    utterance.rate = 1.2; // Increased speed for more natural speech
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Add error handler to log TTS errors
    utterance.onerror = (event) => {
      console.error('TTS Error:', event.error, 'Language:', lang, 'Voice:', selectedVoice?.name);
      setIsSpeaking(false);
      if (options.onError) {
        options.onError(`Speech synthesis error: ${event.error} (Language: ${lang})`);
      }
    };

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (options.onEnd) {
        options.onEnd();
      }
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      if (options.onError) {
        options.onError(`Speech synthesis error: ${event.error}`);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const pause = () => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
    }
  };

  const resume = () => {
    if (isSupported && !isSpeaking && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
    pause,
    resume,
  };
}
