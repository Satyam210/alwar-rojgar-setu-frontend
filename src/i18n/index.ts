import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enJobs from './locales/en/jobs.json';
import enApplications from './locales/en/applications.json';
import enCandidate from './locales/en/candidate.json';
import enEmployer from './locales/en/employer.json';
import enAdmin from './locales/en/admin.json';
import enValidation from './locales/en/validation.json';

import hiCommon from './locales/hi/common.json';
import hiAuth from './locales/hi/auth.json';
import hiJobs from './locales/hi/jobs.json';
import hiApplications from './locales/hi/applications.json';
import hiCandidate from './locales/hi/candidate.json';
import hiEmployer from './locales/hi/employer.json';
import hiAdmin from './locales/hi/admin.json';
import hiValidation from './locales/hi/validation.json';

export const SUPPORTED_LANGUAGES = ['en', 'hi'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const NAMESPACES = [
  'common',
  'auth',
  'jobs',
  'applications',
  'candidate',
  'employer',
  'admin',
  'validation',
] as const;

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    jobs: enJobs,
    applications: enApplications,
    candidate: enCandidate,
    employer: enEmployer,
    admin: enAdmin,
    validation: enValidation,
  },
  hi: {
    common: hiCommon,
    auth: hiAuth,
    jobs: hiJobs,
    applications: hiApplications,
    candidate: hiCandidate,
    employer: hiEmployer,
    admin: hiAdmin,
    validation: hiValidation,
  },
} as const;

/** localStorage key the language detector persists the chosen language under. */
export const LANG_KEY = 'ars.lang';

/** True until the user has explicitly picked a language at least once. */
export function hasChosenLanguage(): boolean {
  try {
    return Boolean(localStorage.getItem(LANG_KEY));
  } catch {
    return true; // storage unavailable — don't nag the user.
  }
}

/** Keep <html lang> in sync (WCAG 3.1.1) whenever the language changes. */
function syncHtmlLang(lng: string): void {
  document.documentElement.lang = lng;
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // English default (Decisions Q13/Q14); persisted choice wins.
    fallbackLng: 'en',
    supportedLngs: [...SUPPORTED_LANGUAGES],
    ns: [...NAMESPACES],
    defaultNS: 'common',
    detection: {
      order: ['localStorage', 'htmlTag'],
      lookupLocalStorage: LANG_KEY,
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  });

i18n.on('languageChanged', syncHtmlLang);
syncHtmlLang(i18n.resolvedLanguage ?? 'en');

export function changeLanguage(lng: AppLanguage): void {
  void i18n.changeLanguage(lng);
}

export default i18n;
