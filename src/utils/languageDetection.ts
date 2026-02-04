// Language detection utility for TTS
// Maps detected language patterns to TTS language codes

// Language code mappings for TTS
const LANGUAGE_CODE_MAP: Record<string, string> = {
  // Indian Languages
  'hi': 'hi-IN', // Hindi
  'te': 'te-IN', // Telugu
  'ta': 'ta-IN', // Tamil
  'kn': 'kn-IN', // Kannada
  'ml': 'ml-IN', // Malayalam
  'mr': 'mr-IN', // Marathi
  'gu': 'gu-IN', // Gujarati
  'bn': 'bn-IN', // Bengali
  'pa': 'pa-IN', // Punjabi
  'or': 'or-IN', // Odia
  'ur': 'ur-IN', // Urdu
  'as': 'as-IN', // Assamese
  
  // Other languages
  'es': 'es-ES', // Spanish
  'fr': 'fr-FR', // French
  'de': 'de-DE', // German
  'it': 'it-IT', // Italian
  'pt': 'pt-BR', // Portuguese
  'ja': 'ja-JP', // Japanese
  'ko': 'ko-KR', // Korean
  'zh': 'zh-CN', // Chinese
  'ar': 'ar-SA', // Arabic
  'ru': 'ru-RU', // Russian
  'nl': 'nl-NL', // Dutch
  'pl': 'pl-PL', // Polish
  'tr': 'tr-TR', // Turkish
  'th': 'th-TH', // Thai
  'vi': 'vi-VN', // Vietnamese
};

// Character range patterns for language detection
const LANGUAGE_PATTERNS: Array<{ pattern: RegExp; lang: string }> = [
  // Hindi (Devanagari)
  { pattern: /[\u0900-\u097F]/, lang: 'hi-IN' },
  // Telugu
  { pattern: /[\u0C00-\u0C7F]/, lang: 'te-IN' },
  // Tamil
  { pattern: /[\u0B80-\u0BFF]/, lang: 'ta-IN' },
  // Kannada
  { pattern: /[\u0C80-\u0CFF]/, lang: 'kn-IN' },
  // Malayalam
  { pattern: /[\u0D00-\u0D7F]/, lang: 'ml-IN' },
  // Marathi (Devanagari - same as Hindi, but we'll detect based on context)
  { pattern: /[\u0900-\u097F]/, lang: 'mr-IN' },
  // Gujarati
  { pattern: /[\u0A80-\u0AFF]/, lang: 'gu-IN' },
  // Bengali
  { pattern: /[\u0980-\u09FF]/, lang: 'bn-IN' },
  // Punjabi (Gurmukhi)
  { pattern: /[\u0A00-\u0A7F]/, lang: 'pa-IN' },
  // Odia
  { pattern: /[\u0B00-\u0B7F]/, lang: 'or-IN' },
  // Urdu (Arabic script)
  { pattern: /[\u0600-\u06FF]/, lang: 'ur-IN' },
  // Assamese (same as Bengali script)
  { pattern: /[\u0980-\u09FF]/, lang: 'as-IN' },
  
  // Chinese
  { pattern: /[\u4E00-\u9FFF]/, lang: 'zh-CN' },
  // Japanese (Hiragana, Katakana, Kanji)
  { pattern: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/, lang: 'ja-JP' },
  // Korean
  { pattern: /[\uAC00-\uD7AF]/, lang: 'ko-KR' },
  // Arabic
  { pattern: /[\u0600-\u06FF]/, lang: 'ar-SA' },
  // Russian (Cyrillic)
  { pattern: /[\u0400-\u04FF]/, lang: 'ru-RU' },
  // Thai
  { pattern: /[\u0E00-\u0E7F]/, lang: 'th-TH' },
];

/**
 * Detect the language of text and return appropriate TTS language code
 * @param text Text to detect language for
 * @returns TTS language code (e.g., 'en-US', 'hi-IN', 'te-IN')
 */
export function detectLanguageForTTS(text: string): string {
  if (!text || !text.trim()) {
    return 'en-US'; // Default to English
  }

  // Don't clean the text first - we need the original characters for detection
  // Just remove extra whitespace
  const textForDetection = text.trim();

  // Count non-ASCII characters to determine if it's likely non-English
  const nonAsciiChars = textForDetection.match(/[^\x00-\x7F]/g);
  const nonAsciiCount = nonAsciiChars ? nonAsciiChars.length : 0;
  const totalChars = textForDetection.length;
  
  // If less than 10% non-ASCII, likely English
  if (nonAsciiCount / totalChars < 0.1) {
    return 'en-US';
  }

  // Check for non-English character patterns
  // Sort patterns by specificity (more specific patterns first)
  const sortedPatterns = [...LANGUAGE_PATTERNS].sort((a, b) => {
    // Prioritize patterns that match more characters
    const aMatches = textForDetection.match(a.pattern)?.length || 0;
    const bMatches = textForDetection.match(b.pattern)?.length || 0;
    return bMatches - aMatches;
  });

  // Track best match
  let bestMatch: { lang: string; ratio: number } | null = null;

  for (const { pattern, lang } of sortedPatterns) {
    if (pattern.test(textForDetection)) {
      // Count matches to determine primary language
      const matches = textForDetection.match(pattern);
      if (matches && matches.length > 0) {
        // Calculate ratio of matching characters
        const matchRatio = matches.length / totalChars;
        
        // If this is a better match, use it
        if (!bestMatch || matchRatio > bestMatch.ratio) {
          bestMatch = { lang, ratio: matchRatio };
        }
      }
    }
  }

  // If we found a good match (at least 15% of characters), use it
  if (bestMatch && bestMatch.ratio > 0.15) {
    return bestMatch.lang;
  }

  // Check for common English words only if we didn't find a strong non-English pattern
  const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'are', 'tax', 'holidays', 'budget', 'union', 'finance', 'can', 'how', 'when', 'where', 'why', 'who', 'which', 'about', 'explain'];
  const words = textForDetection.toLowerCase().split(/\s+/);
  const englishWordCount = words.filter(word => englishWords.includes(word.replace(/[^\w]/g, ''))).length;
  const englishRatio = words.length > 0 ? englishWordCount / words.length : 0;

  // If more than 30% English words and no strong non-English pattern, assume English
  if (englishRatio > 0.3 && (!bestMatch || bestMatch.ratio < 0.15)) {
    return 'en-US';
  }

  // If we have a match but it's weak, still use it if non-ASCII ratio is high
  if (bestMatch && nonAsciiCount / totalChars > 0.3) {
    return bestMatch.lang;
  }

  // Default to English if no pattern matches
  return 'en-US';
}

/**
 * Get TTS language code from a language code (e.g., 'hi' -> 'hi-IN')
 * @param langCode Language code (e.g., 'hi', 'en', 'te')
 * @returns TTS language code
 */
export function getTTSLanguageCode(langCode: string): string {
  if (!langCode) return 'en-US';
  
  // If already a full code (e.g., 'en-US'), return as is
  if (langCode.includes('-')) {
    return langCode;
  }
  
  // Map short code to full TTS code
  return LANGUAGE_CODE_MAP[langCode] || 'en-US';
}
