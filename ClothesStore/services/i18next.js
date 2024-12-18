import { initReactI18next } from "react-i18next";
import i18next from "i18next";
// import { getLanguageFromStorage } from './AsyncStorageUtils';

import en from "../locales/en.json";
import vi from "../locales/vi.json";
import es from "../locales/es.json";
import zh from "../locales/zh.json";
import fr from "../locales/fr.json";
import de from "../locales/de.json";
import ja from "../locales/ja.json";
import ko from "../locales/ko.json";
import ru from "../locales/ru.json";
import it from "../locales/it.json";

export const languageResources = {
  vi: { translation: vi },
  en: { translation: en },
  es: { translation: es },
  zh: { translation: zh },
  fr: { translation: fr },
  de: { translation: de },
  ja: { translation: ja },
  ko: { translation: ko },
  ru: { translation: ru },
  it: { translation: it },
};

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'vi',
  fallbackLng: 'vi',
  resources: languageResources,
});

export default i18next;

