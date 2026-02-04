// Languages supported by Web Speech API
export interface SpeechLanguage {
  code: string;
  name: string;
  nativeName?: string;
}

export const SPEECH_LANGUAGES: SpeechLanguage[] = [
  // English
  { code: 'en-US', name: 'English', nativeName: 'English' },
  
  // Indian Languages
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or-IN', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'ur-IN', name: 'Urdu', nativeName: 'اردو' },
  { code: 'as-IN', name: 'Assamese', nativeName: 'অসমীয়া' },
  
  // Other Major Languages
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文 (简体)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文 (繁體)' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский' },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski' },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

export const DEFAULT_LANGUAGE = 'en-US';

export function getLanguageName(code: string): string {
  const lang = SPEECH_LANGUAGES.find(l => l.code === code);
  return lang ? lang.name : code;
}

export function getLanguageByCode(code: string): SpeechLanguage | undefined {
  return SPEECH_LANGUAGES.find(l => l.code === code);
}
