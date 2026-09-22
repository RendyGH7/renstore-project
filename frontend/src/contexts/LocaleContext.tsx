import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, Currency, translations, Translations } from '../i18n/translations';

interface LocaleContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  exchangeRate: number; // 1 USD in IDR (e.g. 15,800)
  setExchangeRate: (rate: number) => void;
  formatPrice: (amountInIdr: number | string | undefined | null) => string;
  convertPrice: (amountInIdr: number | string | undefined | null) => number;
  t: (key: keyof Translations) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// Default Exchange rate: 1 USD = 15,800 IDR
const DEFAULT_USD_RATE = 15800;

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('renstore_language');
    return saved === 'en' || saved === 'id' ? saved : 'id';
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('renstore_currency');
    return saved === 'USD' || saved === 'IDR' ? saved : 'IDR';
  });

  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_USD_RATE);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('renstore_language', lang);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem('renstore_currency', curr);
  };

  // Convert raw IDR amount to target currency number
  const convertPrice = (amountInIdr: number | string | undefined | null): number => {
    if (amountInIdr === null || amountInIdr === undefined) return 0;
    const num = typeof amountInIdr === 'string' ? parseFloat(amountInIdr) : amountInIdr;
    if (isNaN(num)) return 0;

    if (currency === 'USD') {
      return num / exchangeRate;
    }
    return num;
  };

  // Format price string with symbols
  const formatPrice = (amountInIdr: number | string | undefined | null): string => {
    if (amountInIdr === null || amountInIdr === undefined) return currency === 'USD' ? '$0.00' : 'IDR 0';
    const num = typeof amountInIdr === 'string' ? parseFloat(amountInIdr) : amountInIdr;
    if (isNaN(num)) return currency === 'USD' ? '$0.00' : 'IDR 0';

    if (currency === 'USD') {
      const usdValue = num / exchangeRate;
      return '$' + usdValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    // Default IDR
    return 'IDR ' + Math.round(num).toLocaleString('id-ID');
  };

  // Translation helper
  const t = (key: keyof Translations): string => {
    const currentDict = translations[language] || translations.id;
    return currentDict[key] || translations.id[key] || String(key);
  };

  return (
    <LocaleContext.Provider
      value={{
        language,
        currency,
        setLanguage,
        setCurrency,
        exchangeRate,
        setExchangeRate,
        formatPrice,
        convertPrice,
        t,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

export default LocaleContext;
