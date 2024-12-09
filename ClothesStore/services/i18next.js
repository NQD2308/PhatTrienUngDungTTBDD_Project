import { initReactI18next } from "react-i18next";
import i18next from "i18next";
// import { getLanguageFromStorage } from './AsyncStorageUtils';

import en from "../locales/en.json";
import vi from "../locales/vi.json";

export const languageResources = {
  vi: { translation: vi },
  en: { translation: en },
};

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'vi',
  fallbackLng: 'vi',
  resources: languageResources,
});

export default i18next;

