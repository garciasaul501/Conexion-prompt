import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';

interface FooterProps {
  onNavigateToVerify?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-slate-600">
          <span className="font-display font-semibold text-slate-900">Conexión Prompts</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{t.footer.tagline}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>© 2026</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500">
          <span className="inline-flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.footer.verifiedPayments}</span>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{t.footer.sslProtection}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <div className="inline-flex items-center gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`transition-colors cursor-pointer ${
                  language === lang.code
                    ? 'text-slate-900 font-semibold underline underline-offset-4'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {lang.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
