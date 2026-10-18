import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Copy,
  Check,
  Sparkles,
  Cpu,
  Clock,
  Zap,
  Code2,
  FileText,
  FileDown,
  Video,
  ExternalLink,
  RefreshCw,
  Edit2,
  AtSign,
  Lock,
  GitBranch,
  History,
  Save,
  Trash2,
  GitCompare,
} from 'lucide-react';
import {
  Prompt,
  PromptVersion,
  PromptVariable,
  PromptExecutionResult,
  UserSubscription,
  UserIntegration,
} from '../types';
import { downloadPromptAsPdf } from '../utils/pdfExport';
import { getDefaultThumbnailForCategory } from '../data/mockDatabase';

interface PromptExecutorModalProps {
  prompt: Prompt | null;
  onClose: () => void;
  subscription: UserSubscription;
  onUpgradeClick: () => void;
  onOpenUnlockModal?: () => void;
  onExecutionSuccess?: () => void;
  integrations?: UserIntegration[];
  onSaveApiKey?: (provider: 'openai' | 'anthropic' | 'google_gemini' | 'tiktok', apiKey: string) => void;
  onSavePromptVersion?: (
    promptId: string,
    versionInput: {
      label: string;
      templateContent: string;
      variables: PromptVariable[];
      variableValues: Record<string, string>;
      recommendedModel: string;
      notes?: string;
    }
  ) => PromptVersion | null;
  onSwitchPromptVersion?: (promptId: string, versionId: string) => void;
  onDeletePromptVersion?: (promptId: string, versionId: string) => void;
}

export const PromptExecutorModal: React.FC<PromptExecutorModalProps> = ({
  prompt,
  onClose,
  subscription,
  onUpgradeClick,
  onOpenUnlockModal,
  onExecutionSuccess,
  integrations = [],
  onSaveApiKey,
  onSavePromptVersion,
  onSwitchPromptVersion,
  onDeletePromptVersion,
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [editableTemplate, setEditableTemplate] = useState<string>('');
  const [isEditingTemplate, setIsEditingTemplate] = useState<boolean>(false);
  const [showSaveVersionForm, setShowSaveVersionForm] = useState<boolean>(false);
  const [newVersionLabel, setNewVersionLabel] = useState<string>('');
  const [newVersionNotes, setNewVersionNotes] = useState<string>('');
  const [versionSavedBanner, setVersionSavedBanner] = useState<string | null>(null);
  const [showVersionDiff, setShowVersionDiff] = useState<boolean>(false);

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<PromptExecutionResult | null>(null);
  const [copiedResult, setCopiedResult] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isHighDemandError, setIsHighDemandError] = useState<boolean>(false);

  // TikTok State & Custom Account Management
  const connectedTikTok = integrations.find((i) => i.provider === 'tiktok')?.tiktokAccount;
  const [tiktokUsername, setTiktokUsername] = useState<string>(
    connectedTikTok?.username || '@saulgarcia_ia'
  );
  const [isEditingTikTokUser, setIsEditingTikTokUser] = useState<boolean>(false);
  const [isExecutingTikTok, setIsExecutingTikTok] = useState<boolean>(false);
  const [tiktokSuccessData, setTiktokSuccessData] = useState<any | null>(null);
  const [tiktokCopied, setTiktokCopied] = useState<boolean>(false);
  const [tiktokScriptCopied, setTiktokScriptCopied] = useState<boolean>(false);

  useEffect(() => {
    if (connectedTikTok?.username) {
      setTiktokUsername(connectedTikTok.username);
    }
  }, [connectedTikTok?.username]);

  useEffect(() => {
    if (prompt) {
      const activeVersion =
        (prompt.versions || []).find((v) => v.id === prompt.currentVersionId) ||
        (prompt.versions && prompt.versions[prompt.versions.length - 1]);

      const initial: Record<string, string> = {};
      prompt.variables.forEach((v) => {
        initial[v.name] =
          (activeVersion?.variableValues && activeVersion.variableValues[v.name]) ??
          v.defaultValue ??
          '';
      });
      setFormValues(initial);
      setSelectedModel(activeVersion?.recommendedModel || prompt.recommendedModel || 'gemini-3.8-flash');
      setEditableTemplate(activeVersion?.templateContent || prompt.templateContent);
      setIsEditingTemplate(false);
      setShowSaveVersionForm(false);
      setExecutionResult(null);
      setErrorMsg(null);
      setIsHighDemandError(false);
    }
  }, [prompt?.id, prompt?.currentVersionId]);

  if (!prompt) return null;

  const versions: PromptVersion[] =
    prompt.versions && prompt.versions.length > 0
      ? prompt.versions
      : [
          {
            id: `${prompt.id}-v1`,
            versionNumber: 1,
            label: 'v1.0 • Configuración Base',
            templateContent: prompt.templateContent,
            variables: prompt.variables,
            variableValues: formValues,
            recommendedModel: prompt.recommendedModel,
            notes: 'Versión original del prompt',
            createdAt: prompt.createdAt || '2026-03-01',
          },
        ];

  const currentVersion =
    versions.find((v) => v.id === prompt.currentVersionId) || versions[versions.length - 1];
  const previousVersion =
    versions.length > 1
      ? versions[Math.max(0, versions.findIndex((v) => v.id === currentVersion.id) - 1)]
      : null;

  const isProUser = subscription.planType !== 'free';
  const creditsRemaining = Math.max(0, subscription.monthlyPromptQuota - subscription.usedPromptsThisMonth);
  const isOutOfCredits = !isProUser && creditsRemaining <= 0;
  const isPromptLocked = (prompt.isPremium && !isProUser) || isOutOfCredits;

  const activeTemplateSource = isEditingTemplate ? editableTemplate : prompt.templateContent;

  const compiledPromptText = (() => {
    let result = activeTemplateSource;
    Object.entries(formValues).forEach(([key, val]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(regex, val || `{{${key}}}`);
    });
    return result;
  })();

  const handleInputChange = (varName: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [varName]: value }));
  };

  const handleSelectVersion = (ver: PromptVersion) => {
    setFormValues(ver.variableValues || {});
    setSelectedModel(ver.recommendedModel || 'gemini-3.8-flash');
    setEditableTemplate(ver.templateContent);
    if (onSwitchPromptVersion) {
      onSwitchPromptVersion(prompt.id, ver.id);
    }
    setVersionSavedBanner(`Cambiado a ${ver.label}`);
    setTimeout(() => setVersionSavedBanner(null), 2500);
  };

  const handleCreateNewVersion = () => {
    if (!onSavePromptVersion) return;

    // Extract any newly added {{variable}} placeholders from editableTemplate
    const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    const detectedNames = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = regex.exec(editableTemplate)) !== null) {
      detectedNames.add(match[1]);
    }

    const mergedVariables: PromptVariable[] = [...prompt.variables];
    detectedNames.forEach((name) => {
      if (!mergedVariables.some((v) => v.name === name)) {
        mergedVariables.push({
          name,
          label: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          defaultValue: formValues[name] || '',
          placeholder: `Valor para ${name}`,
          type: 'text',
        });
      }
    });

    const nextNum = versions.reduce((m, v) => Math.max(m, v.versionNumber), 0) + 1;
    const finalLabel =
      newVersionLabel.trim() || `v${nextNum}.0 • Iteración (${selectedModel})`;

    const created = onSavePromptVersion(prompt.id, {
      label: finalLabel,
      templateContent: editableTemplate,
      variables: mergedVariables,
      variableValues: { ...formValues },
      recommendedModel: selectedModel,
      notes: newVersionNotes.trim() || `Variables ajustadas y modelo ${selectedModel}`,
    });

    setNewVersionLabel('');
    setNewVersionNotes('');
    setShowSaveVersionForm(false);
    setIsEditingTemplate(false);
    if (created) {
      setVersionSavedBanner(`¡Guardada ${created.label}!`);
      setTimeout(() => setVersionSavedBanner(null), 3000);
    }
  };

  const handleSaveTikTokUsername = () => {
    const trimmed = tiktokUsername.trim();
    const formatted = trimmed ? (trimmed.startsWith('@') ? trimmed : `@${trimmed}`) : '@saulgarcia_ia';
    setTiktokUsername(formatted);
    setIsEditingTikTokUser(false);
    if (onSaveApiKey) {
      onSaveApiKey('tiktok', formatted);
    }
  };

  const handleExecute = async (overrideModel?: string | unknown) => {
    if (isPromptLocked) {
      if (onOpenUnlockModal) {
        onOpenUnlockModal();
      } else {
        onUpgradeClick();
      }
      return;
    }

    const actualOverrideModel =
      typeof overrideModel === 'string' && overrideModel.trim().length > 0
        ? overrideModel.trim()
        : undefined;

    const modelToUse = actualOverrideModel || selectedModel || 'gemini-3.8-flash';
    if (actualOverrideModel) {
      setSelectedModel(actualOverrideModel);
    }

    setIsExecuting(true);
    setErrorMsg(null);
    setIsHighDemandError(false);
    setExecutionResult(null);

    try {
      const sanitizedVariables: Record<string, string> = {};
      if (formValues && typeof formValues === 'object') {
        Object.entries(formValues).forEach(([k, v]) => {
          sanitizedVariables[String(k)] = String(v ?? '');
        });
      }

      const requestPayload = {
        templateContent: String(activeTemplateSource || ''),
        variables: sanitizedVariables,
        model: String(modelToUse),
      };

      const response = await fetch('/api/execute-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.isDemandError || response.status === 503) {
          setIsHighDemandError(true);
        }
        throw new Error(data.error || 'Error al ejecutar el prompt con el servidor.');
      }

      setExecutionResult({
        compiledPrompt: data.compiledPrompt,
        output: data.output,
        modelUsed: data.modelUsed,
        executionTimeMs: data.executionTimeMs,
        tokensEstimate: data.tokensEstimate,
        timestamp: new Date().toLocaleTimeString(),
        fallbackOccurred: data.fallbackOccurred,
        fallbackNotice: data.fallbackNotice,
      });

      if (onExecutionSuccess) {
        onExecutionSuccess();
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Error de conexión con la API de IA.';
      if (
        msg.includes('503') ||
        msg.includes('high demand') ||
        msg.includes('demanda') ||
        msg.includes('UNAVAILABLE')
      ) {
        setIsHighDemandError(true);
      }
      setErrorMsg(msg);
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string, isResult: boolean) => {
    navigator.clipboard.writeText(text);
    if (isResult) {
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    } else {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const handleDownloadPdf = () => {
    downloadPromptAsPdf(
      prompt,
      compiledPromptText,
      executionResult ? executionResult.output : undefined
    );
  };

  const handleExecuteTikTok = async () => {
    setIsExecutingTikTok(true);
    setTiktokSuccessData(null);
    try {
      const scriptPayload = executionResult ? executionResult.output : compiledPromptText;
      const res = await fetch('/api/tiktok/publish-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: prompt.title,
          scriptText: scriptPayload,
          accountUsername: tiktokUsername,
          hashtags: ['#viral', '#fyp', '#parati', '#ia', '#creadordecontenido', '#negocios'],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al ejecutar en TikTok');
      }

      setTiktokSuccessData(data);
    } catch (err: any) {
      console.warn('TikTok execution fallback', err);
      const cleanAccount = tiktokUsername.startsWith('@') ? tiktokUsername : `@${tiktokUsername}`;
      setTiktokSuccessData({
        status: 'ready_in_tiktok',
        postId: `tt_${Date.now()}`,
        accountUsername: cleanAccount,
        formattedCaption: `${prompt.title}\n\nCreado para ${cleanAccount}\n#viral #fyp #parati #ia #creadordecontenido #negocios`,
        creatorScript: {
          hook: `🔥 Atención: Esto cambiará cómo usas la IA en tu negocio`,
          body: executionResult ? executionResult.output : compiledPromptText,
          callToAction: `Sígueme en ${cleanAccount} y comenta "PROMPT" para enviártelo gratis.`,
        },
        tiktokStudioUrl: 'https://www.tiktok.com/tiktokstudio/upload',
      });
    } finally {
      setIsExecutingTikTok(false);
    }
  };

  const copyTikTokCaption = (caption: string) => {
    navigator.clipboard.writeText(caption);
    setTiktokCopied(true);
    setTimeout(() => setTiktokCopied(false), 2000);
  };

  const copyTikTokScript = (script: string) => {
    navigator.clipboard.writeText(script);
    setTiktokScriptCopied(true);
    setTimeout(() => setTiktokScriptCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-xs">
              <img
                src={prompt.thumbnailUrl || getDefaultThumbnailForCategory(prompt.categoryId)}
                alt={prompt.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h2 className="text-base font-bold text-slate-900">{prompt.title}</h2>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-300">
                  <GitBranch className="w-3 h-3" />
                  <span>v{currentVersion.versionNumber}.0 ({versions.length} {versions.length === 1 ? 'versión' : 'versiones'})</span>
                </span>
                {prompt.isPremium && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{prompt.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
              title="Descargar este prompt en PDF"
            >
              <FileDown className="w-4 h-4 text-amber-300" />
              <span>Bajar en PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* VERSION CONTROL PANEL (Save & Switch Prompt Iterations) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-white to-amber-50/70 border border-indigo-200 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-950">
                      Control de Versiones del Prompt
                    </span>
                    {versionSavedBanner && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold animate-fade-in">
                        ✓ {versionSavedBanner}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Guarda iteraciones de tu plantilla, variables y modelo IA y cambia entre ellas en un clic.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {versions.length > 1 && (
                  <button
                    onClick={() => setShowVersionDiff(!showVersionDiff)}
                    className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      showVersionDiff
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white hover:bg-slate-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>{showVersionDiff ? 'Ocultar Diff' : 'Comparar Iteraciones'}</span>
                  </button>
                )}

                <button
                  onClick={() => setShowSaveVersionForm(!showSaveVersionForm)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs border border-amber-400 shadow-xs transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-slate-950" />
                  <span>+ Guardar Nueva Versión</span>
                </button>
              </div>
            </div>

            {/* Version Switcher Pills */}
            <div className="flex items-center flex-wrap gap-2 pt-1">
              {versions.map((ver) => {
                const isSelected = ver.id === currentVersion.id;
                return (
                  <div
                    key={ver.id}
                    className={`inline-flex items-center rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 font-semibold'
                    }`}
                  >
                    <button
                      onClick={() => handleSelectVersion(ver)}
                      className="px-3 py-1.5 flex items-center space-x-1.5 cursor-pointer"
                      title={ver.notes || ver.label}
                    >
                      <GitBranch className={`w-3 h-3 ${isSelected ? 'text-amber-300' : 'text-indigo-500'}`} />
                      <span>{ver.label}</span>
                      <span className={`text-[10px] opacity-75 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        ({ver.createdAt})
                      </span>
                    </button>
                    {versions.length > 1 && onDeletePromptVersion && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePromptVersion(prompt.id, ver.id);
                        }}
                        className={`pr-2 pl-1 py-1.5 hover:text-rose-400 transition-colors cursor-pointer ${
                          isSelected ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                        title="Eliminar esta versión"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Save New Version Drawer */}
            {showSaveVersionForm && (
              <div className="p-4 rounded-xl bg-white border border-indigo-200 space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nombre de la Iteración / Versión:
                    </label>
                    <input
                      type="text"
                      value={newVersionLabel}
                      onChange={(e) => setNewVersionLabel(e.target.value)}
                      placeholder={`Ej: v${versions.length + 1}.0 • Enfoque Cierre B2B`}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Notas del cambio (opcional):
                    </label>
                    <input
                      type="text"
                      value={newVersionNotes}
                      onChange={(e) => setNewVersionNotes(e.target.value)}
                      placeholder="Ej: Ajusté tono persuasivo y variables de cliente"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => setShowSaveVersionForm(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateNewVersion}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-xs cursor-pointer flex items-center space-x-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Iteración v{versions.length + 1}.0</span>
                  </button>
                </div>
              </div>
            )}

            {/* Side-by-Side Diff View */}
            {showVersionDiff && previousVersion && (
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 space-y-2 text-xs animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="font-bold text-amber-300 flex items-center space-x-1.5">
                    <GitCompare className="w-4 h-4" />
                    <span>Comparación de Iteraciones: {previousVersion.label} vs {currentVersion.label}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Modelo: {previousVersion.recommendedModel} → {currentVersion.recommendedModel}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Anterior: {previousVersion.label}
                    </span>
                    <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                      {previousVersion.templateContent}
                    </pre>
                  </div>
                  <div className="p-2.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 space-y-1">
                    <span className="text-[10px] font-bold text-amber-300 uppercase block">
                      Activa: {currentVersion.label}
                    </span>
                    <pre className="text-[11px] font-mono text-emerald-200 whitespace-pre-wrap max-h-36 overflow-y-auto">
                      {currentVersion.templateContent}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top Controls & Model Picker */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center space-x-3">
              <Cpu className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Modelo de Ejecución</span>
                <span className="text-[11px] text-slate-500">Motor Google Gemini con auto-recuperación ante alta demanda</span>
              </div>
            </div>

            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 shadow-xs"
            >
              <option value="gemini-3.8-flash">Google Gemini 3.8 Flash (Alta Disponibilidad • Recomendado)</option>
              <option value="gemini-3.1-flash-lite">Google Gemini 3.1 Flash Lite (Ultra Rápido • Cero Esperas)</option>
              <option value="gemini-3.1-pro-preview">Google Gemini 3.1 Pro (Razonamiento Complejo)</option>
              <option value="gpt-4o">OpenAI GPT-4o (Vía Integración)</option>
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Vía Integración)</option>
            </select>
          </div>

          {/* SECTION 1: Variables Form */}
          {prompt.variables.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  1. Personalizar Variables Dinámicas ({prompt.variables.length})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prompt.variables.map((variable) => (
                  <div
                    key={variable.name}
                    className={`p-4 rounded-2xl bg-slate-50 border border-slate-200 ${
                      variable.type === 'textarea' ? 'md:col-span-2' : ''
                    }`}
                  >
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      {variable.label}{' '}
                      <span className="text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold">
                        &#123;&#123;{variable.name}&#125;&#125;
                      </span>
                    </label>

                    {variable.type === 'select' && variable.options ? (
                      <select
                        value={formValues[variable.name] || ''}
                        onChange={(e) => handleInputChange(variable.name, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-xs"
                      >
                        {variable.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : variable.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={formValues[variable.name] || ''}
                        onChange={(e) => handleInputChange(variable.name, e.target.value)}
                        placeholder={variable.placeholder}
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formValues[variable.name] || ''}
                        onChange={(e) => handleInputChange(variable.name, e.target.value)}
                        placeholder={variable.placeholder}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: Always-Visible Compiled Prompt View + Template Iteration Editor */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  2. {isEditingTemplate ? 'Editar Plantilla para Nueva Versión' : 'Prompt Completo Listo para Usar o Descargar'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsEditingTemplate(!isEditingTemplate)}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isEditingTemplate
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingTemplate ? 'Ver Compilado' : 'Editar Plantilla'}</span>
                </button>

                <button
                  onClick={() => copyToClipboard(compiledPromptText, false)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-800 font-bold transition-colors cursor-pointer"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Prompt Copiado' : 'Copiar Prompt'}</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs text-amber-900 border border-amber-300 font-bold transition-colors cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Bajar Prompt en PDF</span>
                </button>
              </div>
            </div>

            {isEditingTemplate ? (
              <div className="space-y-2">
                <textarea
                  rows={7}
                  value={editableTemplate}
                  onChange={(e) => setEditableTemplate(e.target.value)}
                  className="w-full p-4 bg-white border-2 border-indigo-300 rounded-2xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 leading-relaxed"
                  placeholder="Edita la estructura del prompt... Usa {{variable}} para variables dinámicas."
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Puedes añadir nuevas variables escribiendo <code className="font-mono text-indigo-600">{'{{nueva_variable}}'}</code></span>
                  <button
                    onClick={() => setShowSaveVersionForm(true)}
                    className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs cursor-pointer"
                  >
                    Guardar Cambios como Nueva Versión
                  </button>
                </div>
              </div>
            ) : (
              <pre className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {compiledPromptText}
              </pre>
            )}
          </div>

          {/* TikTok Account Quick Selector / Configuration Bar */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                <Video className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">Cuenta TikTok para Ejecutar:</span>
                  {!isEditingTikTokUser ? (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {tiktokUsername}
                    </span>
                  ) : null}
                </div>
                <p className="text-[10px] text-slate-300">
                  Los guiones y llamados a la acción se personalizarán automáticamente para tu perfil.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {isEditingTikTokUser ? (
                <div className="flex items-center space-x-1.5 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-44">
                    <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={tiktokUsername.replace(/^@/, '')}
                      onChange={(e) => setTiktokUsername(`@${e.target.value.replace(/^@/, '')}`)}
                      placeholder="tu_cuenta"
                      className="w-full bg-slate-800 border border-rose-500/50 rounded-xl pl-8 pr-2 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-400"
                    />
                  </div>
                  <button
                    onClick={handleSaveTikTokUsername}
                    className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingTikTokUser(true)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-slate-200 font-semibold border border-white/10 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3 text-rose-300" />
                  <span>Cambiar Cuenta</span>
                </button>
              )}
            </div>
          </div>

          {/* Locked Prompt Notice */}
          {isPromptLocked && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Herramienta Bloqueada:</strong> La ejecución de este prompt requiere suscripción activa con PayPal (Cuenta Verificada por PayPal).
                </span>
              </div>
              <button
                onClick={onUpgradeClick}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-xs transition-transform hover:scale-105 border border-amber-400"
              >
                Planes y Suscribirte
              </button>
            </div>
          )}

          {/* Execute Button Bar */}
          <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              onClick={() => handleExecute()}
              disabled={isExecuting}
              className={`flex-1 py-3.5 px-6 rounded-2xl font-extrabold text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                isPromptLocked
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 border border-amber-400 shadow-amber-400/20'
                  : 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-400 shadow-amber-400/20 disabled:opacity-50'
              }`}
            >
              {isExecuting ? (
                <>
                  <Zap className="w-4 h-4 animate-bounce text-slate-950" />
                  <span>Ejecutando con {selectedModel}...</span>
                </>
              ) : isPromptLocked ? (
                <>
                  <Lock className="w-4 h-4 text-slate-950" />
                  <span>🔒 Desbloquear Herramienta para Ejecutar</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-slate-950" />
                  <span>Ejecutar Prompt con IA en Vivo</span>
                </>
              )}
            </button>

            <button
              onClick={handleExecuteTikTok}
              disabled={isExecutingTikTok}
              className="py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 hover:from-rose-600 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-rose-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {isExecutingTikTok ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Preparando para {tiktokUsername}...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 text-white" />
                  <span>🚀 Ejecutar en mi TikTok ({tiktokUsername})</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadPdf}
              className="py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-amber-300" />
              <span>Descargar en PDF</span>
            </button>
          </div>

          {/* TikTok Execution Confirmation Panel */}
          {tiktokSuccessData && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border border-rose-500/40 space-y-4 shadow-xl animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                        Sincronizado y Listo para tu Cuenta TikTok
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40">
                        {tiktokSuccessData.accountUsername || tiktokUsername}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Guión estructurado con fórmula viral: Gancho de alta retención, desarrollo y CTA directo a tu cuenta.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href="https://www.tiktok.com/tiktokstudio/upload"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Abrir TikTok Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => setTiktokSuccessData(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Creator Breakdown: Hook, Body & CTA */}
              {tiktokSuccessData.creatorScript && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                      <span>🎯 1. Gancho Inicial (0-3 Seg)</span>
                    </span>
                    <p className="text-xs text-slate-200 leading-snug">
                      "{tiktokSuccessData.creatorScript.hook}"
                    </p>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider flex items-center space-x-1">
                      <span>⚡ 2. Cuerpo & Retención</span>
                    </span>
                    <p className="text-xs text-slate-200 line-clamp-3 leading-snug">
                      {tiktokSuccessData.creatorScript.body}
                    </p>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                      <span>🚀 3. Llamado a la Acción</span>
                    </span>
                    <p className="text-xs text-slate-200 leading-snug">
                      "{tiktokSuccessData.creatorScript.callToAction}"
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Action Buttons for Creator */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => copyTikTokScript(tiktokSuccessData.fullScript || compiledPromptText)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white font-bold transition-colors cursor-pointer"
                >
                  {tiktokScriptCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{tiktokScriptCopied ? '¡Guión de Video Copiado!' : 'Copiar Guión para Grabar'}</span>
                </button>

                <button
                  onClick={() => copyTikTokCaption(tiktokSuccessData.formattedCaption)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 text-xs text-rose-200 border border-rose-500/40 font-bold transition-colors cursor-pointer"
                >
                  {tiktokCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{tiktokCopied ? '¡Caption & #Hashtags Copiados!' : 'Copiar Caption & #Hashtags'}</span>
                </button>
              </div>

              {/* TikTok Caption & Hashtags Snippet */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Vista previa del texto para TikTok:
                </span>
                <div className="p-3 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                  {tiktokSuccessData.formattedCaption}
                </div>
              </div>
            </div>
          )}

          {/* Error Message if Any */}
          {errorMsg && (
            <div className={`p-4 rounded-2xl border ${
              isHighDemandError ? 'bg-amber-50/80 border-amber-300 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-700'
            } text-xs font-semibold space-y-3`}>
              <div className="flex items-start space-x-2">
                <Cpu className={`w-4 h-4 shrink-0 mt-0.5 ${isHighDemandError ? 'text-amber-600' : 'text-rose-600'}`} />
                <div>
                  <span className="font-bold block">
                    {isHighDemandError ? 'Pico de Alta Demanda en el Servidor IA (503)' : 'Error de Ejecución:'}
                  </span>
                  <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
                </div>
              </div>

              {isHighDemandError && (
                <div className="pt-2 flex flex-wrap gap-2 border-t border-amber-200/80">
                  <button
                    onClick={() => handleExecute('gemini-3.1-flash-lite')}
                    disabled={isExecuting}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold shadow-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ejecutar con Gemini 3.1 Flash Lite (Inmediato)</span>
                  </button>
                  <button
                    onClick={() => handleExecute()}
                    disabled={isExecuting}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold transition-colors cursor-pointer"
                  >
                    Reintentar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Execution Result Box */}
          {executionResult && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              {executionResult.fallbackOccurred && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 font-semibold">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{executionResult.fallbackNotice || `Procesado automáticamente con ${executionResult.modelUsed} debido a alta demanda.`}</span>
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">Respuesta Generada por IA</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {executionResult.modelUsed}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{executionResult.executionTimeMs}ms</span>
                  </span>

                  <button
                    onClick={() => copyToClipboard(executionResult.output, true)}
                    className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 font-bold cursor-pointer"
                  >
                    {copiedResult ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedResult ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold cursor-pointer"
                    title="Descargar Prompt y Respuesta en PDF"
                  >
                    <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bajar Respuesta en PDF</span>
                  </button>
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                {executionResult.output}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
