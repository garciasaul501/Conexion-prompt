import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Bookmark,
  SlidersHorizontal,
  Wand2,
  FileDown,
  Eye,
  EyeOff,
  Lock,
  X,
} from 'lucide-react';
import { PromptCategory, Prompt, UserSubscription } from '../types';
import { PromptCard } from './PromptCard';
import { PromptIdeaModal } from './PromptIdeaModal';
import { ControlPanel } from './ControlPanel';
import { downloadPromptsCatalogPdf } from '../utils/pdfExport';
import { useLanguage } from '../i18n/LanguageContext';

interface PromptGalleryProps {
  categories: PromptCategory[];
  prompts: Prompt[];
  savedPromptIds: string[];
  onToggleSave: (promptId: string) => void;
  onExecutePrompt: (prompt: Prompt) => void;
  subscription: UserSubscription;
  onUpgradeClick: () => void;
  onOpenUnlockModal?: () => void;
  onAddPromptToLibrary: (prompt: Prompt) => void;
  onSwitchPromptVersion?: (promptId: string, versionId: string) => void;
  onNavigateToAnalytics?: () => void;
}

export const PromptGallery: React.FC<PromptGalleryProps> = ({
  categories,
  prompts,
  savedPromptIds,
  onToggleSave,
  onExecutePrompt,
  subscription,
  onUpgradeClick,
  onOpenUnlockModal,
  onAddPromptToLibrary,
  onSwitchPromptVersion,
  onNavigateToAnalytics,
}) => {
  const { t, translateCategory } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat-all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchScope, setSearchScope] = useState<'all' | 'title' | 'description'>('all');
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'pro'>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [onlySaved, setOnlySaved] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'uses' | 'rating' | 'newest'>('uses');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState<boolean>(false);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState<boolean>(false);
  const [expandAllPrompts, setExpandAllPrompts] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isProUser = subscription.planType !== 'free';
  const remainingCredits = Math.max(
    0,
    subscription.monthlyPromptQuota - subscription.usedPromptsThisMonth
  );

  const activeFilterCount =
    (pricingFilter !== 'all' ? 1 : 0) +
    (modelFilter !== 'all' ? 1 : 0) +
    (searchScope !== 'all' ? 1 : 0) +
    (onlySaved ? 1 : 0);

  const handleCardExecute = (prompt: Prompt) => {
    if (prompt.isPremium && !isProUser) {
      if (onOpenUnlockModal) {
        onOpenUnlockModal();
      } else {
        onUpgradeClick();
      }
      return;
    }
    onExecutePrompt(prompt);
  };

  const resetAllFilters = () => {
    setSelectedCategoryId('cat-all');
    setSearchQuery('');
    setSearchScope('all');
    setPricingFilter('all');
    setModelFilter('all');
    setOnlySaved(false);
  };

  const filteredPrompts = useMemo(() => {
    return prompts
      .filter((p) => {
        if (selectedCategoryId !== 'cat-all' && p.categoryId !== selectedCategoryId) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchTags = p.tags.some((tag) => tag.toLowerCase().includes(q));

          if (searchScope === 'title') {
            if (!matchTitle) return false;
          } else if (searchScope === 'description') {
            if (!matchDesc) return false;
          } else {
            if (!matchTitle && !matchDesc && !matchTags) return false;
          }
        }
        if (pricingFilter === 'free' && p.isPremium) return false;
        if (pricingFilter === 'pro' && !p.isPremium) return false;
        if (modelFilter !== 'all' && p.recommendedModel !== modelFilter) return false;
        if (onlySaved && !savedPromptIds.includes(p.id)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'uses') return b.usesCount - a.usesCount;
        if (sortBy === 'rating') return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    prompts,
    selectedCategoryId,
    searchQuery,
    searchScope,
    pricingFilter,
    modelFilter,
    onlySaved,
    sortBy,
    savedPromptIds,
  ]);

  return (
    <div className="space-y-8 pb-16">
      {/* Clean Workspace Header */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              {t.gallery.heroTitle}{' '}
              <span className="text-indigo-600">{t.gallery.heroHighlight}</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {t.gallery.heroSubtitle}
            </p>

            {/* Unboxed Metadata Row */}
            <div className="pt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 tabular-nums">
              <span className="font-medium text-slate-700">
                {prompts.length} {t.gallery.promptsAvailable}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className={isProUser ? 'text-emerald-700 font-medium' : 'text-slate-700 font-medium'}>
                {isProUser
                  ? t.gallery.proActive
                  : `${remainingCredits} / ${subscription.monthlyPromptQuota} ${t.gallery.creditsAvailable}`}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{t.gallery.modelsSupport}</span>
            </div>
          </div>

          {/* One Clear Primary CTA + One Quiet Secondary Action */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsIdeaModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              <span>{t.gallery.createFromIdea}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                downloadPromptsCatalogPdf(filteredPrompts, 'Catalogo Completo de Prompts IA')
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-slate-500" />
              <span>
                {t.gallery.exportPdf} ({filteredPrompts.length})
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Streamlined Search & Categories Bar */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Clean Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.gallery.searchPlaceholder}
              aria-label={t.gallery.searchPlaceholder}
              className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  title={t.gallery.searchClear}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                {filteredPrompts.length}/{prompts.length}
              </span>
            </div>
          </div>

          {/* Compact Filter & Sort Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'uses' | 'rating' | 'newest')}
              aria-label="Sort prompts"
              className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="uses">{t.gallery.sortUses}</option>
              <option value="rating">{t.gallery.sortRating}</option>
              <option value="newest">{t.gallery.sortNewest}</option>
            </select>

            <button
              type="button"
              onClick={() => setShowFiltersDrawer((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showFiltersDrawer || activeFilterCount > 0
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showFiltersDrawer ? t.gallery.hideFilters : t.gallery.filters}</span>
              {activeFilterCount > 0 && (
                <span className="ml-0.5 text-[11px] font-mono tabular-nums opacity-80">
                  ({activeFilterCount})
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Clean Horizontal Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const count =
              cat.id === 'cat-all'
                ? prompts.length
                : prompts.filter((p) => p.categoryId === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{translateCategory(cat.id, cat.name)}</span>
                <span
                  className={`text-[11px] font-mono tabular-nums ${
                    isSelected ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Collapsible Secondary Filters Bar (keeps default screen clean!) */}
        {showFiltersDrawer && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Pricing Segmented Filter */}
              <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                {(
                  [
                    ['all', t.gallery.filterAll],
                    ['free', t.gallery.filterFree],
                    ['pro', t.gallery.filterPro],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPricingFilter(value)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      pricingFilter === value
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Search Scope */}
              <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                {(
                  [
                    ['all', t.gallery.searchScopeAll],
                    ['title', t.gallery.searchScopeTitle],
                    ['description', t.gallery.searchScopeDesc],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSearchScope(value)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      searchScope === value
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Model Filter */}
              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">{t.gallery.allModels}</option>
                <option value="gemini-3.8-flash">Gemini 3.8 Flash</option>
                <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
                <option value="gpt-4o">OpenAI GPT-4o</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              </select>

              {/* Favorites Toggle */}
              <button
                type="button"
                onClick={() => setOnlySaved((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  onlySaved
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${onlySaved ? 'fill-indigo-600' : ''}`} />
                <span>
                  {t.gallery.favorites} ({savedPromptIds.length})
                </span>
              </button>

              {/* Expand All Templates Toggle */}
              <button
                type="button"
                onClick={() => setExpandAllPrompts((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  expandAllPrompts
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                {expandAllPrompts ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{expandAllPrompts ? t.gallery.collapseAll : t.gallery.expandAll}</span>
              </button>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                {t.gallery.resetFilters}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Subtle Free-Tier Notice (calm slate, zero loud yellow clutter) */}
      {!isProUser && (
        <div className="bg-slate-900 text-white rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-semibold text-white">{t.gallery.freeNoticeTitle}.</span>{' '}
              <span className="text-slate-300">{t.gallery.freeNoticeBody}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenUnlockModal || onUpgradeClick}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.gallery.unlockBtn}
          </button>
        </div>
      )}

      {/* Prompts Grid */}
      {filteredPrompts.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              isSaved={savedPromptIds.includes(prompt.id)}
              onToggleSave={onToggleSave}
              onExecute={handleCardExecute}
              isProUser={isProUser}
              defaultExpanded={expandAllPrompts}
              onSwitchVersion={onSwitchPromptVersion}
            />
          ))}
        </section>
      ) : (
        <section className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <SlidersHorizontal className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-display text-lg font-semibold text-slate-900">
            {t.gallery.emptyTitle}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{t.gallery.emptyBody}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsIdeaModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              <span>{t.gallery.emptyCreateBtn}</span>
            </button>
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              {t.gallery.resetFilters}
            </button>
          </div>
        </section>
      )}

      {/* Productivity Overview Panel (Clean, Organized, Collapsible Ranking + CSV Export) */}
      <ControlPanel
        prompts={prompts}
        categories={categories}
        subscription={subscription}
        onExecutePrompt={handleCardExecute}
        onUpgradeClick={onUpgradeClick}
        onNavigateToAnalytics={onNavigateToAnalytics}
      />

      {/* Calm Closing Callout */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <h2 className="font-display text-base sm:text-lg font-semibold text-slate-900">
            {t.gallery.bottomTitle}
          </h2>
          <p className="text-sm text-slate-600">{t.gallery.bottomBody}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() =>
              downloadPromptsCatalogPdf(prompts, 'Catalogo Oficial Completo de Prompts IA')
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            <span>{t.gallery.downloadCatalogBtn}</span>
          </button>

          <button
            type="button"
            onClick={onUpgradeClick}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.gallery.viewPlansBtn}
          </button>
        </div>
      </section>

      {/* Idea-to-Prompt AI Creator Modal */}
      <PromptIdeaModal
        isOpen={isIdeaModalOpen}
        onClose={() => setIsIdeaModalOpen(false)}
        onExecutePrompt={onExecutePrompt}
        onAddPromptToLibrary={onAddPromptToLibrary}
      />
    </div>
  );
};
