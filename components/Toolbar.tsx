import React from 'react';
import { 
  AlignLeft, 
  Minimize2, 
  Copy, 
  Trash2, 
  Wand2, 
  Bug,
  Quote,
  Sun,
  Moon,
  Languages
} from 'lucide-react';
import { Theme, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onUnescape: () => void;
  onCopy: () => void;
  onClear: () => void;
  onFix: () => void;
  onGenerate: () => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  theme: Theme;
  lang: Language;
  isAiLoading: boolean;
  isValid: boolean;
  hasError: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onFormat,
  onMinify,
  onUnescape,
  onCopy,
  onClear,
  onFix,
  onGenerate,
  onToggleTheme,
  onToggleLang,
  theme,
  lang,
  isAiLoading,
  isValid,
  hasError
}) => {
  const t = TRANSLATIONS[lang];
  const buttonClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-medium transition-all";

  return (
    <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 transition-colors duration-200">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 mr-4 shrink-0">
           <div className={`w-3 h-3 rounded-full ${isValid ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
           <span className={`text-sm font-medium ${isValid ? 'text-green-600 dark:text-green-500' : 'text-rose-600 dark:text-rose-500'}`}>
             {isValid ? t.valid : t.invalid}
           </span>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

        <button 
          onClick={onFormat}
          className={buttonClass}
          title={t.format}
        >
          <AlignLeft size={14} />
          <span className="hidden sm:inline">{t.format}</span>
        </button>

        <button 
          onClick={onMinify}
          className={buttonClass}
          title={t.minify}
        >
          <Minimize2 size={14} />
          <span className="hidden sm:inline">{t.minify}</span>
        </button>

        <button 
          onClick={onUnescape}
          className={buttonClass}
          title={t.unescape}
        >
          <Quote size={14} />
          <span className="hidden sm:inline">{t.unescape}</span>
        </button>
      </div>

      <div className="flex items-center gap-2 pl-2">
         {hasError && (
           <button 
            onClick={onFix}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-all shadow-lg shadow-indigo-500/20 animate-pulse whitespace-nowrap"
           >
             <Bug size={14} />
             <span>{isAiLoading ? t.fixing : t.fix}</span>
           </button>
         )}

         {!hasError && (
             <button 
             onClick={onGenerate}
             disabled={isAiLoading}
             className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 dark:bg-indigo-600/20 dark:hover:bg-indigo-600/30 dark:text-indigo-300 dark:border-indigo-500/30 text-xs font-medium transition-all whitespace-nowrap"
            >
              <Wand2 size={14} />
              <span>{isAiLoading ? t.generating : t.sample}</span>
            </button>
         )}

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

        <button 
          onClick={onToggleLang}
          className={buttonClass}
          title={t.switchLang}
        >
          <Languages size={14} />
          <span className="ml-1 text-[10px] font-bold">{lang === 'zh' ? 'CN' : 'EN'}</span>
        </button>

        <button 
          onClick={onToggleTheme}
          className={buttonClass}
          title={t.switchTheme}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <button 
          onClick={onCopy}
          className={buttonClass}
          title={t.copy}
        >
          <Copy size={14} />
          <span className="hidden sm:inline">{t.copy}</span>
        </button>
        
        <button 
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-900/50 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 text-xs font-medium transition-all"
          title={t.clear}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};