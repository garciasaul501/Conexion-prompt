import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigateToVerify?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToVerify }) => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-300 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="font-bold text-slate-900">Conexión Prompts © 2026</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">Plataforma SaaS de Prompts de IA</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
          {onNavigateToVerify && (
            <button
              onClick={onNavigateToVerify}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold border border-blue-200 transition cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>Verificar Pagos (garciasaul@hotmail.com)</span>
            </button>
          )}
          <span>Full-Stack Express + React</span>
          <span>•</span>
          <a
            href="https://whop.com/@saulmente"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 hover:underline font-semibold"
          >
            Whop @saulmente
          </a>
          <span>•</span>
          <span>PayPal Business</span>
        </div>

      </div>
    </footer>
  );
};

