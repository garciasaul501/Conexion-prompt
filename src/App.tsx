import React, { useState } from 'react';
import { Navbar, NavTabType } from './components/Navbar';
import { PromptGallery } from './components/PromptGallery';
import { PromptOptimizerPage } from './components/PromptOptimizerPage';
import { IdeaGeneratorPage } from './components/IdeaGeneratorPage';
import { MyPromptsPage } from './components/MyPromptsPage';
import { PromptExecutorModal } from './components/PromptExecutorModal';
import { PricingPage } from './components/PricingPage';
import { IntegrationsTab } from './components/IntegrationsTab';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { Footer } from './components/Footer';
import { UnlockModal } from './components/UnlockModal';
import { PromptAnalyticsDashboard } from './components/PromptAnalyticsDashboard';

import {
  INITIAL_CATEGORIES,
  INITIAL_PROMPTS,
  INITIAL_SUBSCRIPTION,
  INITIAL_INTEGRATIONS,
} from './data/mockDatabase';
import { Prompt, PromptVersion, PromptVariable, UserSubscription, UserIntegration } from './types';

function ensurePromptHasInitialVersion(p: Prompt): Prompt {
  if (p.versions && p.versions.length >= 2) {
    return {
      ...p,
      currentVersionId: p.currentVersionId || p.versions[p.versions.length - 1].id,
    };
  }
  const defaultValues: Record<string, string> = {};
  (p.variables || []).forEach((v) => {
    defaultValues[v.name] = v.defaultValue || '';
  });
  const v1: PromptVersion = {
    id: `${p.id}-v1`,
    versionNumber: 1,
    label: 'v1.0 • Configuración Base',
    templateContent: p.templateContent,
    variables: p.variables || [],
    variableValues: defaultValues,
    recommendedModel: 'gpt-4o',
    notes: 'Versión base inicial (85.1% éxito medio • ~1,190 ms)',
    createdAt: p.createdAt || '2026-03-01',
  };
  const v2: PromptVersion = {
    id: `${p.id}-v2`,
    versionNumber: 2,
    label: 'v2.0 • Few-Shot Optimizada',
    templateContent: `${p.templateContent}\n\n[Directriz v2.0 Few-Shot]: Asegura coherencia estructural y valida cada variable antes de emitir la respuesta final.`,
    variables: p.variables || [],
    variableValues: defaultValues,
    recommendedModel: p.recommendedModel || 'gemini-3.8-flash',
    notes: 'Iteración con validación de variables (95.2% éxito • ~790 ms)',
    createdAt: '2026-03-22',
  };
  const v3: PromptVersion = {
    id: `${p.id}-v3`,
    versionNumber: 3,
    label: 'v3.0 • Producción Flash',
    templateContent: p.templateContent,
    variables: p.variables || [],
    variableValues: defaultValues,
    recommendedModel: p.recommendedModel || 'gemini-3.8-flash',
    notes: 'Versión óptima de baja latencia (99.1% éxito • ~510 ms)',
    createdAt: '2026-04-12',
  };
  return {
    ...p,
    versions: [v1, v2, v3],
    currentVersionId: v3.id,
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabType>('pricing');
  const [categories] = useState(INITIAL_CATEGORIES);
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    try {
      const saved = localStorage.getItem('saul_prompts_catalog_v2');
      if (saved) {
        const parsed: Prompt[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(ensurePromptHasInitialVersion);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROMPTS.map(ensurePromptHasInitialVersion);
  });
  const [savedPromptIds, setSavedPromptIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saul_saved_prompt_ids');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['p-1', 'p-3'];
  });
  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    try {
      const saved = localStorage.getItem('saul_prompts_subscription');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SUBSCRIPTION;
  });
  const [integrations, setIntegrations] = useState<UserIntegration[]>(INITIAL_INTEGRATIONS);
  const [executingPrompt, setExecutingPrompt] = useState<Prompt | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState<boolean>(false);

  const persistPrompts = (updatedList: Prompt[]) => {
    try {
      localStorage.setItem('saul_prompts_catalog_v2', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleSave = (promptId: string) => {
    setSavedPromptIds((prev) => {
      const updated = prev.includes(promptId) ? prev.filter((id) => id !== promptId) : [...prev, promptId];
      try {
        localStorage.setItem('saul_saved_prompt_ids', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleAddPromptToLibrary = (newPrompt: Prompt) => {
    const normalized = ensurePromptHasInitialVersion(newPrompt);
    setPrompts((prev) => {
      const updated = [normalized, ...prev.filter((p) => p.id !== normalized.id)];
      persistPrompts(updated);
      return updated;
    });
    if (!savedPromptIds.includes(normalized.id)) {
      setSavedPromptIds((prev) => {
        const updated = [normalized.id, ...prev];
        try {
          localStorage.setItem('saul_saved_prompt_ids', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    }
  };

  const handleSavePromptVersion = (
    promptId: string,
    versionInput: {
      label: string;
      templateContent: string;
      variables: PromptVariable[];
      variableValues: Record<string, string>;
      recommendedModel: string;
      notes?: string;
    }
  ): PromptVersion | null => {
    let createdVersion: PromptVersion | null = null;

    setPrompts((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== promptId) return p;
        const existingVersions = p.versions && p.versions.length > 0 ? p.versions : ensurePromptHasInitialVersion(p).versions!;
        const nextNum = existingVersions.reduce((max, v) => Math.max(max, v.versionNumber), 0) + 1;
        const newVer: PromptVersion = {
          id: `${promptId}-v${nextNum}-${Date.now()}`,
          versionNumber: nextNum,
          label: versionInput.label.trim() || `v${nextNum}.0 • Iteración #${nextNum}`,
          templateContent: versionInput.templateContent,
          variables: versionInput.variables,
          variableValues: versionInput.variableValues,
          recommendedModel: versionInput.recommendedModel,
          notes: versionInput.notes || 'Configuración personalizada guardada',
          createdAt: new Date().toLocaleString('es-ES', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        createdVersion = newVer;
        const updatedPrompt: Prompt = {
          ...p,
          templateContent: newVer.templateContent,
          variables: newVer.variables,
          recommendedModel: newVer.recommendedModel,
          versions: [...existingVersions, newVer],
          currentVersionId: newVer.id,
        };
        setExecutingPrompt((curr) => (curr && curr.id === promptId ? updatedPrompt : curr));
        return updatedPrompt;
      });
      persistPrompts(updated);
      return updated;
    });

    if (!savedPromptIds.includes(promptId)) {
      handleToggleSave(promptId);
    }

    return createdVersion;
  };

  const handleSwitchPromptVersion = (promptId: string, versionId: string) => {
    setPrompts((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== promptId) return p;
        const targetVer = (p.versions || []).find((v) => v.id === versionId);
        if (!targetVer) return p;
        const updatedPrompt: Prompt = {
          ...p,
          templateContent: targetVer.templateContent,
          variables: targetVer.variables,
          recommendedModel: targetVer.recommendedModel,
          currentVersionId: targetVer.id,
        };
        setExecutingPrompt((curr) => (curr && curr.id === promptId ? updatedPrompt : curr));
        return updatedPrompt;
      });
      persistPrompts(updated);
      return updated;
    });
  };

  const handleDeletePromptVersion = (promptId: string, versionId: string) => {
    setPrompts((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== promptId || !p.versions || p.versions.length <= 1) return p;
        const remaining = p.versions.filter((v) => v.id !== versionId);
        const activeVer =
          p.currentVersionId === versionId ? remaining[remaining.length - 1] : remaining.find((v) => v.id === p.currentVersionId) || remaining[remaining.length - 1];
        const updatedPrompt: Prompt = {
          ...p,
          templateContent: activeVer.templateContent,
          variables: activeVer.variables,
          recommendedModel: activeVer.recommendedModel,
          versions: remaining,
          currentVersionId: activeVer.id,
        };
        setExecutingPrompt((curr) => (curr && curr.id === promptId ? updatedPrompt : curr));
        return updatedPrompt;
      });
      persistPrompts(updated);
      return updated;
    });
  };

  const handleExecutionSuccess = () => {
    setSubscription((prev) => {
      const updated = {
        ...prev,
        usedPromptsThisMonth: prev.usedPromptsThisMonth + 1,
      };
      try {
        localStorage.setItem('saul_prompts_subscription', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleUpdateSubscription = (
    newPlan: string,
    newStatus: 'active' | 'canceled' = 'active',
    details?: Partial<UserSubscription>
  ) => {
    setSubscription((prev) => {
      let quota = 5;
      if (newPlan === '10') quota = 10;
      else if (newPlan === '30') quota = 30;
      else if (newPlan === '50' || newPlan === 'pro') quota = 50;
      else if (newPlan === '100') quota = 100;
      else if (newPlan === '500') quota = 500;
      else if (newPlan === '1000' || newPlan === 'enterprise') quota = 1000;
      else if (details?.monthlyPromptQuota) quota = details.monthlyPromptQuota;

      const updated: UserSubscription = {
        ...prev,
        planType: newPlan,
        status: newStatus,
        monthlyPromptQuota: quota,
        ...(details || {}),
      };
      try {
        localStorage.setItem('saul_prompts_subscription', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleSaveApiKey = (provider: 'openai' | 'anthropic' | 'google_gemini' | 'tiktok', apiKey: string) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.provider === provider) {
          const masked = apiKey.length > 8 ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : '••••••••';
          return {
            ...item,
            hasApiKey: true,
            maskedApiKey: masked,
            isActive: true,
            updatedAt: new Date().toISOString().split('T')[0],
            tiktokAccount:
              provider === 'tiktok'
                ? {
                    isConnected: true,
                    username: apiKey.startsWith('@') ? apiKey : item.tiktokAccount?.username || '@saulgarcia_ia',
                    displayName: item.tiktokAccount?.displayName || 'Saúl García | Creator IA',
                    avatarUrl: item.tiktokAccount?.avatarUrl,
                    followerCount: item.tiktokAccount?.followerCount || 28400,
                    scopes: ['user.info.basic', 'video.upload', 'video.publish'],
                    connectedAt: new Date().toISOString().split('T')[0],
                  }
                : item.tiktokAccount,
          };
        }
        return item;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Header & Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        subscription={subscription}
        prompts={prompts}
        onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'gallery' && (
          <PromptGallery
            categories={categories}
            prompts={prompts}
            savedPromptIds={savedPromptIds}
            onToggleSave={handleToggleSave}
            onExecutePrompt={(prompt) => setExecutingPrompt(prompt)}
            subscription={subscription}
            onUpgradeClick={() => setActiveTab('pricing')}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
            onAddPromptToLibrary={handleAddPromptToLibrary}
            onSwitchPromptVersion={handleSwitchPromptVersion}
          />
        )}

        {activeTab === 'optimizer' && (
          <PromptOptimizerPage
            onExecutePrompt={(prompt) => setExecutingPrompt(prompt)}
            onAddPromptToLibrary={handleAddPromptToLibrary}
            subscription={subscription}
            onUpgradeClick={() => setActiveTab('pricing')}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
          />
        )}

        {activeTab === 'idea-generator' && (
          <IdeaGeneratorPage
            onExecutePrompt={(prompt) => setExecutingPrompt(prompt)}
            onAddPromptToLibrary={handleAddPromptToLibrary}
            onNavigateToGallery={() => setActiveTab('gallery')}
            subscription={subscription}
            onUpgradeClick={() => setActiveTab('pricing')}
            onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
          />
        )}

        {activeTab === 'my-prompts' && (
          <MyPromptsPage
            prompts={prompts}
            savedPromptIds={savedPromptIds}
            onToggleSave={handleToggleSave}
            onExecutePrompt={(prompt) => setExecutingPrompt(prompt)}
            subscription={subscription}
            onUpgradeClick={() => setActiveTab('pricing')}
            onNavigateToIdeaGenerator={() => setActiveTab('idea-generator')}
            onNavigateToGallery={() => setActiveTab('gallery')}
            onSimulateExecution={handleExecutionSuccess}
            onSwitchPromptVersion={handleSwitchPromptVersion}
          />
        )}

        {activeTab === 'analytics' && (
          <div className="max-w-6xl mx-auto pb-16">
            <PromptAnalyticsDashboard
              prompts={prompts}
              onExecutePrompt={(prompt) => setExecutingPrompt(prompt)}
              onSwitchPromptVersion={handleSwitchPromptVersion}
            />
          </div>
        )}

        {activeTab === 'pricing' && (
          <PricingPage
            subscription={subscription}
            onUpdateSubscription={handleUpdateSubscription}
          />
        )}

        {activeTab === 'integrations' && (
          <IntegrationsTab
            integrations={integrations}
            onSaveApiKey={handleSaveApiKey}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureDocs />
        )}
      </main>

      {/* Modal Executor */}
      <PromptExecutorModal
        prompt={executingPrompt}
        onClose={() => setExecutingPrompt(null)}
        subscription={subscription}
        integrations={integrations}
        onSaveApiKey={handleSaveApiKey}
        onUpgradeClick={() => {
          setExecutingPrompt(null);
          setActiveTab('pricing');
        }}
        onOpenUnlockModal={() => {
          setExecutingPrompt(null);
          setIsUnlockModalOpen(true);
        }}
        onExecutionSuccess={handleExecutionSuccess}
        onSavePromptVersion={handleSavePromptVersion}
        onSwitchPromptVersion={handleSwitchPromptVersion}
        onDeletePromptVersion={handleDeletePromptVersion}
      />

      {/* Universal Tool Unlock Modal */}
      <UnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        subscription={subscription}
        onUpdateSubscription={handleUpdateSubscription}
        onNavigateToPricing={() => {
          setIsUnlockModalOpen(false);
          setActiveTab('pricing');
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

