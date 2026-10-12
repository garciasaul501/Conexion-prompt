export interface PromptCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  count: number;
}

export interface PromptVariable {
  name: string;
  label: string;
  description?: string;
  defaultValue?: string;
  placeholder?: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  options?: string[];
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  templateContent: string;
  variables: PromptVariable[];
  isPremium: boolean;
  categoryId: string;
  recommendedModel: 'gemini-3.7-flash' | 'gpt-4o' | 'claude-3-5-sonnet' | 'gemini-3.1-pro-preview' | string;
  authorName: string;
  authorAvatar?: string;
  thumbnailUrl?: string;
  usesCount: number;
  rating: number;
  tags: string[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface UserSubscription {
  userId: string;
  paypalPayerId: string;
  paypalSubscriptionId?: string;
  paypalTransactionId?: string;
  planType: 'free' | 'pro' | 'enterprise' | '10' | '30' | '50' | '100' | '500' | '1000' | string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string;
  monthlyPromptQuota: number;
  usedPromptsThisMonth: number;
  whopDiscountApplied?: boolean;
  whopUsername?: string;
  discountPercent?: number;
  paymentMethod?: 'paypal' | 'whop';
}

export interface PricingTier {
  id: string;
  name: string;
  promptsCount: number;
  badge?: string;
  popular?: boolean;
  monthlyBasePrice: number;
  annualBasePrice: number;
  description: string;
  features: string[];
  recommendedFor: string;
}

export interface TikTokAccount {
  isConnected: boolean;
  username: string;
  displayName: string;
  avatarUrl?: string;
  followerCount?: number;
  scopes?: string[];
  connectedAt?: string;
}

export interface UserIntegration {
  id: string;
  userId: string;
  provider: 'openai' | 'anthropic' | 'google_gemini' | 'tiktok';
  providerName: string;
  hasApiKey: boolean;
  maskedApiKey?: string;
  isActive: boolean;
  updatedAt: string;
  tiktokAccount?: TikTokAccount;
}

export interface PromptExecutionResult {
  compiledPrompt: string;
  output: string;
  modelUsed: string;
  executionTimeMs: number;
  tokensEstimate: number;
  timestamp: string;
  fallbackOccurred?: boolean;
  fallbackNotice?: string;
}

export interface SavedPrompt {
  id: string;
  userId: string;
  promptId: string;
  createdAt: string;
}

export interface OptimizedPromptResponse {
  originalPrompt: string;
  optimizedPrompt: string;
  title: string;
  description: string;
  variables: PromptVariable[];
  categorySuggested: string;
  tags: string[];
  qualityScoreBefore: number;
  qualityScoreAfter: number;
  improvementsApplied: string[];
  tipsForBestResults: string[];
}

export interface PayPalTransaction {
  id: string; // PAYPAL-TXN-...
  orderId: string; // PAYPAL-ORD-...
  subscriptionId?: string; // I-PP-SUB-...
  merchantEmail: string; // garciasaul@hotmail.com
  payerEmail: string;
  payerName?: string;
  plan: 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  currency: string; // 'USD'
  fee: number;
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED';
  whopDiscountApplied: boolean;
  whopUsername?: string;
  date: string;
  verified: boolean;
  verificationHash?: string;
}

export interface PayPalMerchantInfo {
  merchantEmail: string;
  status: 'VERIFIED_ACTIVE';
  accountType: 'PREMIER_BUSINESS';
  defaultCurrency: 'USD';
  whopConnectedUrl: string;
  webhookUrl: string;
  totalVolumeUsd: number;
  completedTransactionsCount: number;
}

