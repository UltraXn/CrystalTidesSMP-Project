import { translate } from 'google-translate-api-x';

const PROTECTION_MAP: Record<string, string> = {
  outrageous: 'ultroso',
  outrageousness: 'ultroso',
  outrageously: 'ultroso',
  ultroso: 'Ultroso',
};

const PROTECTION_REGEX = /\b(?:outrageousness|outrageously|outrageous|ultroso)\b/gi;

export const translateText = async (text: string, targetLang: string = 'en'): Promise<string> => {
  if (!text) return '';

  try {
    const processedText = text;

    try {
      const res = await translate(processedText, {
        to: targetLang,
        forceBatch: false,
        rejectOnPartialFail: false,
      });
      const translatedText = res.text as string;

      // Apply replacements
      return translatedText.replace(PROTECTION_REGEX, (match) => {
        return PROTECTION_MAP[match.toLowerCase()] ?? match;
      });
    } catch (innerError) {
      console.error('Google Translate API Error:', innerError);
      throw innerError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('TranslationService Fatal Error:', error);
    return text; // Fallback to original text
  }
};
