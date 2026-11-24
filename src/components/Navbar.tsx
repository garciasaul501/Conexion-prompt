import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, Lock, Unlock } from 'lucide-react';
import { UserSubscription, Prompt } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';

export type NavTabType =
  | 'gallery'
  | 'optimizer'
  | 'idea-generator'
  | 'my-prompts'
  | 'analytics'
  | 'pricing'
  | 'integrations'
  | 'architecture';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  subscription: UserSubscription;
  prompts?: Prompt[];
  onOpenUnlockModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  subscription,
  onOpenUnlockModal,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const isPro = subscription.planType !== 'free';
  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: Array<{ id: NavTabType; label: string }> = [
    { id: 'gallery', label: t.nav.prompts },
    { id: 'optimizer', label: t.nav.optimizer },
    { id: 'idea-generator', label: t.nav.creator },
    { id: 'my-prompts', label: t.nav.myPrompts },
    { id: 'analytics', label: t.nav.analytics },
    { id: 'integrations', label: t.nav.api },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Clean single-line brand wordmark */}
        <button
          type="button"
          onClick={() => setActiveTab('gallery')}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-md"
        >
          Conexión Prompts
        </button>

        {/* Zone 2: Clean single-line typography navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-7 h-full"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative h-full inline-flex items-center text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language Switcher + Access + Single Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Multi-Language Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={langMenuOpen}
              aria-label={t.nav.language}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentLang.shortLabel}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div
                role="listbox"
                className="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-50"
              >
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const selected = lang.code === language;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        selected
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      {selected ? (
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {lang.shortLabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Account / Plan Access */}
          <button
            type="button"
            onClick={onOpenUnlockModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isPro ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">{t.nav.active}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>{t.nav.access}</span>
              </>
            )}
          </button>

          {/* Primary CTA: Plans */}
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {t.nav.plans}
          </button>
        </div>
      </div>

      {/* Compact Mobile Navigation Row */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden flex items-center gap-1 border-t border-slate-200 bg-white px-3 py-1.5 overflow-x-auto scrollbar-none"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onOpenUnlockModal}
          className="sm:hidden px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          {isPro ? t.nav.active : t.nav.access}
        </button>
      </nav>
    </header>
  );
};
