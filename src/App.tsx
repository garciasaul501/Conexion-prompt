import React, { useState } from 'react';
import { Navbar, NavTabType } from './components/Navbar';
import { PromptGallery } from './components/PromptGallery';
import { PromptOptimizerPage } from './components/PromptOptimizerPage';
import { IdeaGeneratorPage } from './components/IdeaGeneratorPage';
import { MyPromptsPage } from './components/MyPromptsPage';
import { PromptExecutorModal } from './components/PromptExecutorModal';
import { PricingPage } from './components/PricingPage';
import { PayPalVerifierPage } from './components/PayPalVerifierPage';
import { IntegrationsTab } from './components/IntegrationsTab';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { Footer } from './components/Footer';
import { UnlockModal } from './components/UnlockModal';

import {
  INITIAL_CATEGORIES,
  INITIAL_PROMPTS,
  INITIAL_SUBSCRIPTION,
  INITIAL_INTEGRATIONS,
} from './data/mockDatabase';
import { Prompt, UserSubscription, UserIntegration } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabType>('gallery');
  const [categories] = useState(INITIAL_CATEGORIES);
  const [prompts, setPrompts] = useState<Prompt[]>(INITIAL_PROMPTS);
  const [savedPromptIds, setSavedPromptIds] = useState<string[]>(['p-1', 'p-3']);
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

  const handleToggleSave = (promptId: string) => {
    setSavedPromptIds((prev) =>
      prev.includes(promptId) ? prev.filter((id) => id !== promptId) : [...prev, promptId]
    );
  };

  const handleAddPromptToLibrary = (newPrompt: Prompt) => {
    setPrompts((prev) => [newPrompt, ...prev.filter((p) => p.id !== newPrompt.id)]);
    if (!savedPromptIds.includes(newPrompt.id)) {
      setSavedPromptIds((prev) => [newPrompt.id, ...prev]);
    }
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
          />
        )}

        {activeTab === 'pricing' && (
          <PricingPage
            subscription={subscription}
            onUpdateSubscription={handleUpdateSubscription}
            onGoToVerify={() => setActiveTab('paypal-verify')}
          />
        )}

        {activeTab === 'paypal-verify' && (
          <PayPalVerifierPage
            onGoToPricing={() => setActiveTab('pricing')}
            onUnlockWithTransaction={(txn) => {
              handleUpdateSubscription(txn.plan || 'pro', 'active', {
                paypalTransactionId: txn.id,
                paypalSubscriptionId: txn.subscriptionId,
                whopDiscountApplied: txn.whopDiscountApplied,
                whopUsername: txn.whopUsername,
                discountPercent: txn.whopDiscountApplied ? 40 : 0,
                paymentMethod: 'paypal',
              });
              setActiveTab('gallery');
            }}
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
      <Footer onNavigateToVerify={() => setActiveTab('paypal-verify')} />
    </div>
  );
}

