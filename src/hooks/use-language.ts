'use client';

import { useState, useEffect } from 'react';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo' },
];

export const timezones: LanguageOption[] = [
  { code: 'lagos', name: 'West Africa Time', nativeName: 'WAT (UTC+1)' },
  { code: 'london', name: 'Greenwich Mean Time', nativeName: 'GMT (UTC+0)' },
  { code: 'dubai', name: 'Gulf Standard Time', nativeName: 'GST (UTC+4)' },
  { code: 'nairobi', name: 'East Africa Time', nativeName: 'EAT (UTC+3)' },
];

export const currencies: LanguageOption[] = [
  { code: 'ngn', name: 'Nigerian Naira', nativeName: '₦' },
  { code: 'usd', name: 'US Dollar', nativeName: '$' },
  { code: 'gbp', name: 'British Pound', nativeName: '£' },
  { code: 'eur', name: 'Euro', nativeName: '€' },
];

export function useLanguage() {
  const [language, setLanguage] = useState<string>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLanguage() {
      try {
        const res = await fetch('/api/user-preferences');
        if (res.ok) {
          const data = await res.json();
          if (data.data?.language) {
            setLanguage(data.data.language);
          }
        }
      } catch {
        // Use default
      } finally {
        setLoading(false);
      }
    }
    loadLanguage();
  }, []);

  const saveLanguage = async (lang: string) => {
    try {
      const res = await fetch('/api/user-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      });
      if (res.ok) {
        setLanguage(lang);
      }
    } catch {
      // Silent fail
    }
  };

  const getLanguageName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang?.name || code;
  };

  const getNativeName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang?.nativeName || code;
  };

  return {
    language,
    loading,
    saveLanguage,
    getLanguageName,
    getNativeName,
    languages,
  };
}

export const translations: Record<string, Record<string, string>> = {
  en: {
    welcome: 'Welcome',
    settings: 'Settings',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    loading: 'Loading...',
    noData: 'No data available',
    error: 'An error occurred',
    success: 'Success',
    confirm: 'Confirm',
  },
  fr: {
    welcome: 'Bienvenue',
    settings: 'Paramètres',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    export: 'Exporter',
    import: 'Importer',
    loading: 'Chargement...',
    noData: 'Aucune donnée disponible',
    error: 'Une erreur est survenue',
    success: 'Succès',
    confirm: 'Confirmer',
  },
  ar: {
    welcome: 'مرحبا',
    settings: 'الإعدادات',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    export: 'ت��دير',
    import: 'استيراد',
    loading: 'جاري التحميل...',
    noData: 'لا توجد بيانات',
    error: 'حدث خطأ',
    success: 'نجاح',
    confirm: 'تأكيد',
  },
  ha: {
    welcome: 'Maraba',
    settings: 'Saituna',
    save: 'Ajiye',
    cancel: 'Soke',
    delete: 'Goge',
    edit: 'Gyara',
    add: 'Kara',
    search: 'Nemo',
    filter: 'Tace',
    export: 'Fitarwa',
    import: 'Shigo',
    loading: 'Loading...',
    noData: 'Babu bayani',
    error: 'Kuskure',
    success: 'Nasara',
    confirm: 'Tabbatar',
  },
  yo: {
    welcome: 'Kuú orú',
    settings: 'Ètò',
    save: 'Fipamò',
    cancel: 'Kọ́silẹ̀',
    delete: 'Kọ́rú',
    edit: 'Túntúnsí',
    add: 'Fikún',
    search: 'Ọ̀rọ̀',
    filter: 'Ìpínlẹ̀',
    export: 'Ìkọ́ta',
    import: 'Ìfowópamò',
    loading: 'Kó ń yẹ́...',
    noData: 'Ko si data',
    error: 'Aṣiṣẹ́',
    success: 'Aṣeyọ́ri',
    confirm: 'Jẹ́rẹ́',
  },
  ig: {
    welcome: 'Nnoo',
    settings: 'Nhọrụ',
    save: 'Debe',
    cancel: 'Gbochie',
    delete: 'Mechie',
    edit: 'Gbanwe',
    add: 'Tinyekwu',
    search: 'Chọọ',
    filter: 'Tulee',
    export: 'Mepụta',
    import: 'Bulite',
    loading: 'Na-ebu...',
    noData: 'Enweghị data',
    error: 'Nmee',
    success: 'Ihe niile',
    confirm: 'Nkwado',
  },
};

export function t(key: string, lang: string = 'en'): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}