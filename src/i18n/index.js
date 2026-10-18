import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useSettingsStore } from '@/store/useSettingsStore.js';

const resources = {
  en: {
    translation: {
      app: 'Yatraverse',
      tagline: 'Your journey, your universe.',
      nav: {
        dashboard: 'Dashboard',
        trips: 'My trips',
        cities: 'Cities',
        activities: 'Activities',
        ai: 'AI atlas',
        profile: 'Profile',
        admin: 'Admin',
        newTrip: 'Plan new trip',
      },
      actions: { save: 'Save', cancel: 'Cancel', delete: 'Delete', apply: 'Apply', dismiss: 'Dismiss' },
      auth: { demo: 'Continue as Demo Traveller', login: 'Enter the atlas', signup: 'Stamp a passport' },
    },
  },
  hi: {
    translation: {
      app: 'यात्रावर्स',
      tagline: 'आपकी यात्रा, आपका ब्रह्मांड।',
      nav: {
        dashboard: 'डैशबोर्ड',
        trips: 'यात्राएँ',
        cities: 'शहर',
        activities: 'गतिविधियाँ',
        ai: 'एआई एटलस',
        profile: 'प्रोफ़ाइल',
        admin: 'एडमिन',
        newTrip: 'नई यात्रा',
      },
      actions: { save: 'सहेजें', cancel: 'रद्द', delete: 'हटाएँ', apply: 'लागू', dismiss: 'नज़रअंदाज़' },
      auth: { demo: 'डेमो यात्री के रूप में जारी रखें', login: 'एटलस में प्रवेश', signup: 'पासपोर्ट छापें' },
    },
  },
  mr: {
    translation: {
      app: 'यात्रावर्स',
      tagline: 'तुमचा प्रवास, तुमचे विश्व.',
      nav: {
        dashboard: 'डॅशबोर्ड',
        trips: 'प्रवास',
        cities: 'शहरे',
        activities: 'उपक्रम',
        ai: 'एआय अॅटलस',
        profile: 'प्रोफाइल',
        admin: 'अॅडमिन',
        newTrip: 'नवीन प्रवास',
      },
      actions: { save: 'जतन', cancel: 'रद्द', delete: 'हटवा', apply: 'लागू', dismiss: 'सोडा' },
      auth: { demo: 'डेमो प्रवासी म्हणून सुरू ठेवा', login: 'अॅटलासमध्ये या', signup: 'पासपोर्ट उमटवा' },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: useSettingsStore.getState().language || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
