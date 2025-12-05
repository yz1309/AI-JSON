import React, { useState, useEffect, useCallback } from 'react';
import { JsonNode } from './components/JsonNode';
import { Toolbar } from './components/Toolbar';
import { RawJsonEditor } from './components/RawJsonEditor';
import { fixJsonWithAi, generateSampleJson } from './services/geminiService';
import { EditorState, Theme } from './types';
import { AlertCircle } from 'lucide-react';

const DEFAULT_JSON = `{
  "welcome": "AI JSON",
  "instructions": [
    "Paste your JSON on the left",
    "View the formatted tree on the right",
    "Use the toolbar to Format, Minify or Fix"
  ],
  "features": {
    "syntaxHighlighting": true,
    "collapsible": true,
    "aiPower": "Gemini 2.5 Flash"
  },
  "isNull": null,
  "count": 42
}`;

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [state, setState] = useState<EditorState>({
    text: DEFAULT_JSON,
    parsed: undefined,
    error: null,
    errorIndex: null
  });
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Core parsing logic
  const parseJson = useCallback((jsonString: string) => {
    if (!jsonString.trim()) {
      setState(prev => ({ ...prev, text: jsonString, parsed: undefined, error: null, errorIndex: null }));
      return;
    }
    try {
      const parsed = JSON.parse(jsonString);
      setState({ text: jsonString, parsed, error: null, errorIndex: null });
    } catch (err) {
      let errorIndex: number | null = null;
      let message = "Invalid JSON";

      if (err instanceof Error) {
        message = err.message;

        // Try to extract position from typical V8 error messages like "Unexpected token } in JSON at position 42"
        const match = message.match(/at position (\d+)/);
        if (match && match[1]) {
          errorIndex = parseInt(match[1], 10);
        } else if (message.includes("Unexpected end of JSON input")) {
          // Highlight the end of the string
          errorIndex = jsonString.length;
        }
      }

      setState(prev => ({
        ...prev,
        text: jsonString,
        parsed: undefined,
        error: message,
        errorIndex
      }));
    }
  }, []);

  // Initial Load
  useEffect(() => {
    parseJson(DEFAULT_JSON);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleTextChange = (value: string) => {
    parseJson(value);
  };

  const handleFormat = () => {
    if (state.parsed !== undefined) {
      const formatted = JSON.stringify(state.parsed, null, 2);
      parseJson(formatted);
    }
  };

  const handleMinify = () => {
    if (state.parsed !== undefined) {
      const minified = JSON.stringify(state.parsed);
      parseJson(minified);
    }
  };

  const handleUnescape = () => {
    const currentText = state.text.trim();
    if (!currentText) return;

    try {
      // Check if it's a stringified JSON string (e.g. "{\"a\": 1}")
      const parsed = JSON.parse(currentText);
      if (typeof parsed === 'string') {
        parseJson(parsed);
        return;
      }
    } catch (e) {
      // Failed to parse, continue to regex fallback
    }

    // Fallback: Manual regex replacement for raw escaped text (e.g. {\"a\": 1})
    const unescaped = currentText
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\');

    parseJson(unescaped);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(state.text);
  };

  const handleClear = () => {
    parseJson('');
  };

  const handleAiFix = async () => {
    if (!state.error || !state.text) return;
    setIsAiLoading(true);
    try {
      const fixed = await fixJsonWithAi(state.text);
      parseJson(fixed);
    } catch (e) {
      alert("AI failed to fix the JSON. Check console for details.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiGenerate = async () => {
    setIsAiLoading(true);
    try {
      const sample = await generateSampleJson("space exploration mission data");
      parseJson(sample);
    } catch (e) {
      alert("Failed to generate sample data.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className={theme}>
      <div className="h-screen w-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 overflow-hidden transition-colors duration-200">
        {/* Header */}
        <header className="h-14 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              { }
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">AI JSON</h1>
          </div>
        </header>

        {/* Toolbar */}
        <Toolbar
          onFormat={handleFormat}
          onMinify={handleMinify}
          onUnescape={handleUnescape}
          onCopy={handleCopy}
          onClear={handleClear}
          onFix={handleAiFix}
          onGenerate={handleAiGenerate}
          onToggleTheme={toggleTheme}
          theme={theme}
          isAiLoading={isAiLoading}
          isValid={!state.error}
          hasError={!!state.error}
        />

        {/* Main Content - Split View */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

          {/* Left Panel: Raw Input */}
          <section className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 relative min-h-[300px] transition-colors duration-200">
            <div className="absolute top-0 left-0 right-0 h-8 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur z-20 flex items-center px-4 border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-200">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Raw JSON</span>
            </div>

            <RawJsonEditor
              value={state.text}
              onChange={handleTextChange}
              errorIndex={state.errorIndex}
            />

            {/* Error Overlay/Message */}
            {state.error && (
              <div className="absolute bottom-4 left-4 right-4 bg-rose-50 dark:bg-rose-950/95 border border-rose-200 dark:border-rose-500/30 p-3 rounded-md shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 z-30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-rose-600 dark:text-rose-500 shrink-0 mt-0.5" size={16} />
                  <div className="flex-1">
                    <h4 className="text-rose-700 dark:text-rose-400 text-xs font-bold uppercase mb-1">Parsing Error</h4>
                    <p className="text-rose-600 dark:text-rose-200/80 text-xs font-mono break-all">{state.error}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Right Panel: Tree View */}
          <section className="flex-1 flex flex-col bg-white dark:bg-[#0b1221] relative transition-colors duration-200">
            <div className="absolute top-0 left-0 right-0 h-8 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur z-10 flex items-center px-4 border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-200">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Interactive Tree</span>
            </div>

            <div className="flex-1 overflow-auto p-4 pt-12 custom-scrollbar">
              {state.parsed !== undefined ? (
                <JsonNode
                  value={state.parsed}
                  isLast={true}
                  name={undefined}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-4 transition-colors duration-200">
                  {state.error ? (
                    <p className="text-sm">Fix parsing errors to view the tree</p>
                  ) : (
                    <p className="text-sm">Enter valid JSON to visualize</p>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Styles for custom scrollbar */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-track {
            background: #0f172a; 
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9; 
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #334155; 
            border: 2px solid #0f172a;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1; 
            border: 2px solid #f1f5f9;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8; 
          }
        `}</style>
      </div>
    </div>
  );
};

export default App;