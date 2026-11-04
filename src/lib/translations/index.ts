import { en } from './en';
import { ta } from './ta';

export type Language = 'en' | 'ta';

export const translations = {
  en,
  ta,
};

export type TranslationKey = keyof typeof en;

export const getTranslation = (lang: Language, key: TranslationKey): string => {
  return (translations[lang] as any)?.[key] || (translations.en as any)?.[key] || (key as string);
};

export { en, ta };
