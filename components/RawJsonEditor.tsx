import React, { useRef, useLayoutEffect } from 'react';

interface RawJsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  errorIndex: number | null;
}

export const RawJsonEditor: React.FC<RawJsonEditorProps> = ({ value, onChange, errorIndex }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Sync scroll positions
  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Ensure sync on resize or value change
  useLayoutEffect(() => {
    handleScroll();
  });

  const renderHighlight = () => {
    if (errorIndex === null || errorIndex < 0) return value;
    
    // Handle case where error is at the end of input (e.g. "Unexpected end of JSON input")
    // We'll highlight the last character or a placeholder space
    const safeIndex = Math.min(errorIndex, value.length);
    const isEnd = safeIndex === value.length;

    const before = value.substring(0, safeIndex);
    const errorChar = isEnd ? ' ' : value.charAt(safeIndex);
    const after = value.substring(safeIndex + 1);

    return (
      <>
        {before}
        <span className="bg-rose-500/40 border-b-2 border-rose-500 text-transparent min-w-[8px] inline-block rounded-sm">
          {errorChar === '\n' ? ' ' : errorChar}
        </span>
        {after}
      </>
    );
  };

  // Shared styles for perfect alignment
  const fontStyle = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    letterSpacing: '0px'
  };

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-50 dark:bg-slate-900/50 transition-colors duration-200">
      {/* Highlight Layer (Background) */}
      <pre
        ref={preRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full p-4 pt-12 m-0 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words pointer-events-none text-transparent overflow-hidden"
        style={fontStyle}
      >
        {renderHighlight()}
        {/* Extra newline to match textarea behavior if it ends with newline */}
        <br />
      </pre>

      {/* Input Layer (Foreground) */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        spellCheck={false}
        className="absolute inset-0 w-full h-full p-4 pt-12 m-0 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words bg-transparent text-slate-800 dark:text-slate-300 resize-none focus:outline-none custom-scrollbar z-10 placeholder-slate-400 dark:placeholder-slate-600"
        style={fontStyle}
        placeholder="Paste JSON here..."
      />
    </div>
  );
};